import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateEmpresaSchema = z.object({
  nombre: z.string().min(2, 'El nombre de la empresa es requerido').optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  activo: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, email: true, name: true, activo: true } },
        productos: true,
      },
    });

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, empresa });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener empresa' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateEmpresaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await prisma.empresa.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, empresa: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar empresa: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    // Soft delete para mantener historial e integridad referencial
    const updated = await prisma.empresa.update({
      where: { id: params.id },
      data: { activo: false },
    });

    return NextResponse.json({ success: true, message: 'Empresa desactivada correctamente' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al desactivar empresa' }, { status: 500 });
  }
}
