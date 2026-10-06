import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createMermaSchema = z.object({
  empresaId: z.string().min(1, 'La empresa es requerida'),
  tiendaId: z.string().min(1, 'La tienda es requerida'),
  productoId: z.string().min(1, 'El producto es requerido'),
  colocadoraId: z.string().optional(),
  imagenUrl: z.string().min(1, 'La fotografía de evidencia es requerida'),
  descripcion: z.string().min(5, 'Debe especificar una descripción de lo sucedido'),
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

    const mermas = await prisma.productoMalEstado.findMany({
      where,
      include: {
        empresa: { select: { id: true, nombre: true } },
        tienda: { select: { id: true, nombre: true, ciudad: true } },
        producto: { select: { id: true, nombre: true, codigoU: true, codigoBarras: true, imagenUrl: true } },
        colocadora: { select: { id: true, nombre: true, dpi: true } },
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, mermas });
  } catch (error: any) {
    console.error('Error en GET /api/admin/mermas:', error);
    return NextResponse.json({ error: 'Error al consultar productos en mal estado' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createMermaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de merma inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { empresaId, tiendaId, productoId, colocadoraId, imagenUrl, descripcion } = parsed.data;

    const nuevaMerma = await prisma.productoMalEstado.create({
      data: {
        empresaId,
        tiendaId,
        productoId,
        colocadoraId: colocadoraId || null,
        imagenUrl,
        descripcion,
      },
      include: {
        empresa: true,
        tienda: true,
        producto: true,
        colocadora: true,
      },
    });

    return NextResponse.json({ success: true, merma: nuevaMerma }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/mermas:', error);
    return NextResponse.json({ error: 'Error al registrar merma: ' + error.message }, { status: 500 });
  }
}
