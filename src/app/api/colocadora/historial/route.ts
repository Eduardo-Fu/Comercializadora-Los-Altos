import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tiendaId = searchParams.get('tiendaId') || '';
    const empresaId = searchParams.get('empresaId') || '';

    const where: any = {};

    if (user.role === 'COLOCADORA') {
      const profile = await prisma.colocadoraProfile.findUnique({
        where: { userId: user.userId },
      });
      if (!profile) {
        return NextResponse.json({ error: 'Perfil de colocadora no encontrado' }, { status: 404 });
      }
      where.colocadoraId = profile.id;
    }

    if (tiendaId) where.tiendaId = tiendaId;
    if (empresaId) where.empresaId = empresaId;

    const historial = await prisma.inventarioRegistro.findMany({
      where,
      include: {
        colocadora: { select: { id: true, nombre: true } },
        tienda: { select: { id: true, nombre: true, ciudad: true } },
        empresa: { select: { id: true, nombre: true } },
        detalles: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                codigoU: true,
                codigoBarras: true,
                imagenUrl: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, historial });
  } catch (error: any) {
    console.error('Error en GET /api/colocadora/historial:', error);
    return NextResponse.json(
      { error: 'Error al consultar historial de inventarios: ' + error.message },
      { status: 500 }
    );
  }
}
