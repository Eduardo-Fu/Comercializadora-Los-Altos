import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createTiendaSchema = z.object({
  nombre: z.string().min(2, 'El nombre de la tienda/supermercado es requerido'),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const tiendas = await prisma.tienda.findMany({
      where: {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { ciudad: { contains: search, mode: 'insensitive' } },
          { direccion: { contains: search, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: {
            colocadoras: true,
            inventarios: true,
            mermas: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tiendas });
  } catch (error: any) {
    console.error('Error en GET /api/admin/tiendas:', error);
    return NextResponse.json({ error: 'Error al obtener tiendas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createTiendaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de tienda inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { nombre, direccion, ciudad } = parsed.data;

    const nuevaTienda = await prisma.tienda.create({
      data: {
        nombre,
        direccion: direccion || null,
        ciudad: ciudad || null,
        activa: true,
      },
    });

    return NextResponse.json({ success: true, tienda: nuevaTienda }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/tiendas:', error);
    return NextResponse.json({ error: 'Error al registrar tienda: ' + error.message }, { status: 500 });
  }
}
