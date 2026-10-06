import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const inventoryItemSchema = z.object({
  productoId: z.string().min(1, 'El producto es requerido'),
  cantidadFisica: z
    .union([z.number(), z.string()])
    .refine((val) => {
      const strVal = String(val).trim();
      if (!/^\d+$/.test(strVal)) return false;
      if (/^0{2,}$/.test(strVal)) return false;
      const num = parseInt(strVal, 10);
      return Number.isInteger(num) && num >= 0;
    }, 'La cantidad debe ser un número entero mayor o igual a 0 y no puede ser "00"')
    .transform((val) => parseInt(String(val).trim(), 10)),
});

const adminCreateInventarioSchema = z.object({
  colocadoraId: z.string().min(1, 'La colocadora es requerida'),
  tiendaId: z.string().min(1, 'El supermercado es requerido'),
  empresaId: z.string().min(1, 'La empresa es requerida'),
  observaciones: z.string().optional(),
  items: z.array(inventoryItemSchema).min(1, 'Debe registrar al menos un producto'),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const tiendaId = searchParams.get('tiendaId') || '';
    const empresaId = searchParams.get('empresaId') || '';
    const colocadoraId = searchParams.get('colocadoraId') || '';

    const where: any = {};
    if (tiendaId) where.tiendaId = tiendaId;
    if (empresaId) where.empresaId = empresaId;
    if (colocadoraId) where.colocadoraId = colocadoraId;

    const inventarios = await prisma.inventarioRegistro.findMany({
      where,
      include: {
        colocadora: { select: { id: true, nombre: true, dpi: true } },
        tienda: { select: { id: true, nombre: true, ciudad: true } },
        empresa: { select: { id: true, nombre: true } },
        detalles: {
          include: {
            producto: { select: { id: true, nombre: true, codigoU: true, codigoBarras: true, imagenUrl: true } },
          },
        },
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, inventarios });
  } catch (error: any) {
    console.error('Error en GET /api/admin/inventario:', error);
    return NextResponse.json({ error: 'Error al obtener inventarios' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = adminCreateInventarioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de inventario inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { colocadoraId, tiendaId, empresaId, observaciones, items } = parsed.data;

    const registro = await prisma.$transaction(async (tx) => {
      const inventario = await tx.inventarioRegistro.create({
        data: {
          colocadoraId,
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

    return NextResponse.json({ success: true, inventario: registro }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/inventario:', error);
    return NextResponse.json({ error: 'Error al registrar inventario: ' + error.message }, { status: 500 });
  }
}
