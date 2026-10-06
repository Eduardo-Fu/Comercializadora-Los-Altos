import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateColocadoraSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido').optional(),
  dpi: z
    .string()
    .regex(/^\d+$/, 'El DPI debe contener únicamente números')
    .min(10, 'El DPI debe tener al menos 10 dígitos')
    .optional(),
  tiendasIds: z.array(z.string()).optional(),
  estado: z.enum(['ACTIVA', 'INACTIVA']).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const colocadora = await prisma.colocadoraProfile.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, email: true, name: true, activo: true } },
        tiendasAsignadas: {
          include: { tienda: true },
        },
      },
    });

    if (!colocadora) {
      return NextResponse.json({ error: 'Colocadora no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, colocadora });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener colocadora' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateColocadoraSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
    }

    const { nombre, dpi, tiendasIds, estado } = parsed.data;

    await prisma.$transaction(async (tx) => {
      // Actualizar perfil
      await tx.colocadoraProfile.update({
        where: { id: params.id },
        data: {
          ...(nombre ? { nombre } : {}),
          ...(dpi ? { dpi } : {}),
          ...(estado ? { estado } : {}),
        },
      });

      // Actualizar asignación de tiendas si se enviaron
      if (tiendasIds) {
        await tx.colocadoraTienda.deleteMany({
          where: { colocadoraId: params.id },
        });

        if (tiendasIds.length > 0) {
          await tx.colocadoraTienda.createMany({
            data: tiendasIds.map((tiendaId) => ({
              colocadoraId: params.id,
              tiendaId,
            })),
          });
        }
      }
    });

    const updated = await prisma.colocadoraProfile.findUnique({
      where: { id: params.id },
      include: {
        tiendasAsignadas: { include: { tienda: true } },
      },
    });

    return NextResponse.json({ success: true, colocadora: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar colocadora: ' + error.message }, { status: 500 });
  }
}
