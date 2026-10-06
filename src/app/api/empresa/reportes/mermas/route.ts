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
    let targetEmpresaId = searchParams.get('empresaId') || '';

    if (user.role === 'EMPRESA') {
      if (!user.empresaId) {
        return NextResponse.json({ error: 'Usuario sin empresa vinculada' }, { status: 403 });
      }
      targetEmpresaId = user.empresaId;
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const where: any = {};
    if (targetEmpresaId) where.empresaId = targetEmpresaId;
    if (tiendaId) where.tiendaId = tiendaId;

    const mermas = await prisma.productoMalEstado.findMany({
      where,
      include: {
        empresa: { select: { id: true, nombre: true } },
        tienda: { select: { id: true, nombre: true, ciudad: true } },
        producto: { select: { id: true, nombre: true, codigoU: true, codigoBarras: true, imagenUrl: true } },
        colocadora: { select: { id: true, nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    return NextResponse.json({
      success: true,
      totalReportes: mermas.length,
      mermas,
    });
  } catch (error: any) {
    console.error('Error en GET /api/empresa/reportes/mermas:', error);
    return NextResponse.json({ error: 'Error al generar reporte de mermas' }, { status: 500 });
  }
}
