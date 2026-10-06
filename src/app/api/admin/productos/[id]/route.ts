import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateProductoSchema = z.object({
  nombre: z.string().min(2, 'El nombre del producto es requerido').optional(),
  codigoU: z.string().min(1, 'El Código U es requerido').optional(),
  codigoBarras: z.string().min(1, 'El código de barras es requerido').optional(),
  imagenUrl: z.string().optional().nullable(),
  empresaId: z.string().optional(),
  activo: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const producto = await prisma.producto.findUnique({
      where: { id: params.id },
      include: {
        empresa: true,
      },
    });

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, producto });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateProductoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await prisma.producto.update({
      where: { id: params.id },
      data: parsed.data,
      include: { empresa: true },
    });

    return NextResponse.json({ success: true, producto: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar producto: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const updated = await prisma.producto.update({
      where: { id: params.id },
      data: { activo: false },
    });

    return NextResponse.json({ success: true, message: 'Producto desactivado del catálogo' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al desactivar producto' }, { status: 500 });
  }
}
