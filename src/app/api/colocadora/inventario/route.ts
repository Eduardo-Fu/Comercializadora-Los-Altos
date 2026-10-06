import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validación de cantidad según las reglas estrictas del PDF:
// Enteros >= 0, sin letras, evitar '00'
const inventoryItemSchema = z.object({
  productoId: z.string().min(1, 'El producto es requerido'),
  cantidadFisica: z
    .union([z.number(), z.string()])
    .refine((val) => {
      const strVal = String(val).trim();
      // Rechazar letras y caracteres especiales
      if (!/^\d+$/.test(strVal)) return false;
      // Rechazar '00', '000', o ceros repetidos sin valor
      if (/^0{2,}$/.test(strVal)) return false;
      // Convertir a número y validar que sea entero >= 0
      const num = parseInt(strVal, 10);
      return Number.isInteger(num) && num >= 0;
    }, 'La cantidad debe ser un número entero mayor o igual a 0 y no puede ser "00"')
    .transform((val) => parseInt(String(val).trim(), 10)),
});

const createInventarioSchema = z.object({
  colocadoraId: z.string().optional(),
  tiendaId: z.string().min(1, 'La tienda o supermercado atendido es requerido'),
  empresaId: z.string().min(1, 'La empresa colocada es requerida'),
  observaciones: z.string().optional(),
  items: z.array(inventoryItemSchema).min(1, 'Debe ingresar el inventario de al menos un producto'),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createInventarioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de inventario inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { tiendaId, empresaId, items, observaciones } = parsed.data;

    let targetColocadoraId = parsed.data.colocadoraId;

    if (user.role === 'COLOCADORA') {
      const profile = await prisma.colocadoraProfile.findUnique({
        where: { userId: user.userId },
      });
      if (!profile || profile.estado !== 'ACTIVA') {
        return NextResponse.json({ error: 'Perfil de colocadora no activo' }, { status: 403 });
      }
      targetColocadoraId = profile.id;

      // Validar que la tienda esté asignada a la colocadora
      const asignada = await prisma.colocadoraTienda.findFirst({
        where: {
          colocadoraId: profile.id,
          tiendaId,
        },
      });

      if (!asignada) {
        return NextResponse.json(
          { error: 'No tienes asignada esta tienda para registrar inventario' },
          { status: 403 }
        );
      }
    } else if (user.role === 'ADMIN') {
      if (!targetColocadoraId) {
        // Asignar primer perfil activo o crear vínculo si es admin
        const firstColocadora = await prisma.colocadoraProfile.findFirst({
          where: { estado: 'ACTIVA' },
        });
        if (firstColocadora) {
          targetColocadoraId = firstColocadora.id;
        } else {
          return NextResponse.json(
            { error: 'Debe haber al menos una colocadora registrada para asociar el inventario' },
            { status: 400 }
          );
        }
      }
    } else {
      return NextResponse.json({ error: 'No autorizado para ingresar inventario' }, { status: 403 });
    }

    // Guardar inventario en una transacción atómica
    const registro = await prisma.$transaction(async (tx) => {
      const inventario = await tx.inventarioRegistro.create({
        data: {
          colocadoraId: targetColocadoraId!,
          tiendaId,
          empresaId,
          observaciones: observaciones || null,
        },
      });

      await tx.inventarioDetalle.createMany({
        data: items.map((item) => ({
          inventarioRegistroId: inventario.id,
          productoId: item.productoId,
          cantidadFisica: item.cantidadFisica,
        })),
      });

      return inventario;
    });

    const resultadoCompleto = await prisma.inventarioRegistro.findUnique({
      where: { id: registro.id },
      include: {
        tienda: true,
        empresa: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Inventario registrado y enviado exitosamente',
        inventario: resultadoCompleto,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en POST /api/colocadora/inventario:', error);
    return NextResponse.json(
      { error: 'Error al registrar inventario: ' + error.message },
      { status: 500 }
    );
  }
}
