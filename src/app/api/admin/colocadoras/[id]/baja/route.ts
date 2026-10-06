import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const bajaSchema = z.object({
  motivoBaja: z.string().min(5, 'Debe especificar un motivo detallado de la baja'),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = bajaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { motivoBaja } = parsed.data;

    // Buscar colocadora
    const colocadora = await prisma.colocadoraProfile.findUnique({
      where: { id: params.id },
    });

    if (!colocadora) {
      return NextResponse.json({ error: 'Colocadora no encontrada' }, { status: 404 });
    }

    // Actualizar colocadora a INACTIVA y desactivar cuenta de usuario asociada
    const updated = await prisma.$transaction(async (tx) => {
      const perfil = await tx.colocadoraProfile.update({
        where: { id: params.id },
        data: {
          estado: 'INACTIVA',
          motivoBaja,
          fechaBaja: new Date(),
        },
      });

      // Desactivar el acceso de login del usuario
      await tx.user.update({
        where: { id: colocadora.userId },
        data: { activo: false },
      });

      return perfil;
    });

    return NextResponse.json({
      success: true,
      message: 'Colocadora dada de baja exitosamente',
      colocadora: updated,
    });
  } catch (error: any) {
    console.error('Error en POST /api/admin/colocadoras/[id]/baja:', error);
    return NextResponse.json({ error: 'Error al dar de baja: ' + error.message }, { status: 500 });
  }
}
