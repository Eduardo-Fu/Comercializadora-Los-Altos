import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const [
      totalEmpresas,
      totalProductos,
      totalTiendas,
      colocadorasActivas,
      colocadorasInactivas,
      totalInventarios,
      totalMermas,
    ] = await Promise.all([
      prisma.empresa.count({ where: { activo: true } }),
      prisma.producto.count({ where: { activo: true } }),
      prisma.tienda.count({ where: { activa: true } }),
      prisma.colocadoraProfile.count({ where: { estado: 'ACTIVA' } }),
      prisma.colocadoraProfile.count({ where: { estado: 'INACTIVA' } }),
      prisma.inventarioRegistro.count(),
      prisma.productoMalEstado.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalEmpresas,
        totalProductos,
        totalTiendas,
        colocadorasActivas,
        colocadorasInactivas,
        totalInventarios,
        totalMermas,
      },
    });
  } catch (error: any) {
    console.error('Error en /api/admin/stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del sistema' },
      { status: 500 }
    );
  }
}
