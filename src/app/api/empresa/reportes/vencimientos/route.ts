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

    const vencimientos = await prisma.vencimientoRegistro.findMany({
      where,
      include: {
        empresa: { select: { id: true, nombre: true } },
        tienda: { select: { id: true, nombre: true, ciudad: true } },
        producto: { select: { id: true, nombre: true, codigoU: true, codigoBarras: true, imagenUrl: true } },
      },
      orderBy: { fechaVencimiento: 'asc' },
    });

    const now = new Date().getTime();
    let vencidos = 0;
    let porVencer = 0;
    let vigentes = 0;

    const items = vencimientos.map((v) => {
      const target = new Date(v.fechaVencimiento).getTime();
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

      let estado: 'VENCIDO' | 'POR_VENCER' | 'VIGENTE' = 'VIGENTE';
      if (diffDays < 0) {
        estado = 'VENCIDO';
        vencidos++;
      } else if (diffDays <= 30) {
        estado = 'POR_VENCER';
        porVencer++;
      } else {
        vigentes++;
      }

      return {
        ...v,
        diasRestantes: diffDays,
        estado,
      };
    });

    return NextResponse.json({
      success: true,
      resumen: {
        totalLotes: items.length,
        vencidos,
        porVencer,
        vigentes,
      },
      vencimientos: items,
    });
  } catch (error: any) {
    console.error('Error en GET /api/empresa/reportes/vencimientos:', error);
    return NextResponse.json({ error: 'Error al generar reporte de vencimientos' }, { status: 500 });
  }
}
