import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateTiendaSchema = z.object({
  nombre: z.string().min(2, 'El nombre de la tienda es requerido').optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  activa: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const tienda = await prisma.tienda.findUnique({
      where: { id: params.id },
      include: {
        colocadoras: {
          include: {
            colocadora: true,
          },
        },
      },
    });

    if (!tienda) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tienda });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener tienda' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateTiendaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await prisma.tienda.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, tienda: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar tienda: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const updated = await prisma.tienda.update({
      where: { id: params.id },
      data: { activa: false },
    });

    return NextResponse.json({ success: true, message: 'Tienda desactivada correctamente' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al desactivar tienda' }, { status: 500 });
  }
}
