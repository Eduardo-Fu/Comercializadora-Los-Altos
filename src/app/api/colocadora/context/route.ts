import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Si es ADMIN, puede acceder a todo el catálogo y todas las tiendas
    const isAdmin = user.role === 'ADMIN';

    let colocadoraProfile = null;
    let tiendas: any[] = [];

    if (isAdmin) {
      tiendas = await prisma.tienda.findMany({
        where: { activa: true },
        orderBy: { nombre: 'asc' },
      });
    } else {
      // Buscar perfil de colocadora
      colocadoraProfile = await prisma.colocadoraProfile.findUnique({
        where: { userId: user.userId },
        include: {
          tiendasAsignadas: {
            include: {
              tienda: true,
            },
          },
        },
      });

      if (!colocadoraProfile || colocadoraProfile.estado !== 'ACTIVA') {
        return NextResponse.json(
          { error: 'El perfil de colocadora no está activo o no existe' },
          { status: 403 }
        );
      }

      tiendas = colocadoraProfile.tiendasAsignadas
        .map((ta) => ta.tienda)
        .filter((t) => t.activa);
    }

    // Obtener empresas activas y sus productos
    const empresas = await prisma.empresa.findMany({
      where: { activo: true },
      include: {
        productos: {
          where: { activo: true },
          orderBy: { nombre: 'asc' },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json({
      success: true,
      colocadora: colocadoraProfile,
      tiendas,
      empresas,
      isAdmin,
    });
  } catch (error: any) {
    console.error('Error en GET /api/colocadora/context:', error);
    return NextResponse.json(
      { error: 'Error al cargar datos operativos: ' + error.message },
      { status: 500 }
    );
  }
}
