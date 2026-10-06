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

    const sugeridos = await prisma.sugeridoRegistro.findMany({
      where,
      include: {
        empresa: { select: { id: true, nombre: true } },
        tienda: { select: { id: true, nombre: true, ciudad: true } },
        producto: { select: { id: true, nombre: true, codigoU: true, codigoBarras: true, imagenUrl: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    const totalUnidadesSugeridas = sugeridos.reduce((acc, s) => acc + s.cantidadSugerida, 0);

    return NextResponse.json({
      success: true,
      totalRegistros: sugeridos.length,
      totalUnidadesSugeridas,
      sugeridos,
    });
  } catch (error: any) {
    console.error('Error en GET /api/empresa/reportes/sugeridos:', error);
    return NextResponse.json({ error: 'Error al generar reporte de sugeridos' }, { status: 500 });
  }
}
