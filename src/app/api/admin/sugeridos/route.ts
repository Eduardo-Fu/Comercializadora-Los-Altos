import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const sugeridoSchema = z.object({
  empresaId: z.string().min(1, 'La empresa es requerida'),
  tiendaId: z.string().min(1, 'La tienda o supermercado es requerido'),
  productoId: z.string().min(1, 'El producto es requerido'),
  cantidadSugerida: z.number().int().positive('La cantidad sugerida debe ser un entero positivo mayor a 0'),
  notas: z.string().optional(),
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

    const where: any = {};
    if (tiendaId) where.tiendaId = tiendaId;
    if (empresaId) where.empresaId = empresaId;

    const sugeridos = await prisma.sugeridoRegistro.findMany({
      where,
      include: {
        empresa: { select: { id: true, nombre: true } },
        tienda: { select: { id: true, nombre: true, ciudad: true } },
        producto: { select: { id: true, nombre: true, codigoU: true, codigoBarras: true, imagenUrl: true } },
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, sugeridos });
  } catch (error: any) {
    console.error('Error en GET /api/admin/sugeridos:', error);
    return NextResponse.json({ error: 'Error al consultar sugeridos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = sugeridoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de sugerido inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { empresaId, tiendaId, productoId, cantidadSugerida, notas } = parsed.data;

    const nuevoSugerido = await prisma.sugeridoRegistro.create({
      data: {
        empresaId,
        tiendaId,
        productoId,
        cantidadSugerida,
        notas: notas || null,
      },
      include: {
        empresa: true,
        tienda: true,
        producto: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Pedido sugerido registrado exitosamente',
        sugerido: nuevoSugerido,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en POST /api/admin/sugeridos:', error);
    return NextResponse.json(
      { error: 'Error al registrar pedido sugerido: ' + error.message },
      { status: 500 }
    );
  }
}
