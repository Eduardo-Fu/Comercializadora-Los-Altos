import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createVencimientoSchema = z.object({
  empresaId: z.string().min(1, 'La empresa es requerida'),
  tiendaId: z.string().min(1, 'La tienda es requerida'),
  productoId: z.string().min(1, 'El producto es requerido'),
  colocadoraId: z.string().optional(),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0').default(1),
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

    const vencimientos = await prisma.vencimientoRegistro.findMany({
      where,
      include: {
        empresa: { select: { id: true, nombre: true } },
        tienda: { select: { id: true, nombre: true, ciudad: true } },
        producto: { select: { id: true, nombre: true, codigoU: true, codigoBarras: true, imagenUrl: true } },
        colocadora: { select: { id: true, nombre: true } },
      },
      orderBy: { fechaVencimiento: 'asc' },
      take: 100,
    });

    return NextResponse.json({ success: true, vencimientos });
  } catch (error: any) {
    console.error('Error en GET /api/admin/vencimientos:', error);
    return NextResponse.json({ error: 'Error al consultar vencimientos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createVencimientoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de vencimiento inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { empresaId, tiendaId, productoId, colocadoraId, fechaVencimiento, cantidad } = parsed.data;

    const nuevoVencimiento = await prisma.vencimientoRegistro.create({
      data: {
        empresaId,
        tiendaId,
        productoId,
        colocadoraId: colocadoraId || null,
        fechaVencimiento: new Date(fechaVencimiento),
        cantidad,
      },
      include: {
        empresa: true,
        tienda: true,
        producto: true,
      },
    });

    return NextResponse.json({ success: true, vencimiento: nuevoVencimiento }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/vencimientos:', error);
    return NextResponse.json({ error: 'Error al registrar vencimiento: ' + error.message }, { status: 500 });
  }
}
