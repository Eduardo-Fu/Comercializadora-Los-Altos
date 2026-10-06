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
    let targetEmpresaId = searchParams.get('empresaId') || '';

    if (user.role === 'EMPRESA') {
      if (!user.empresaId) {
        return NextResponse.json({ error: 'Usuario sin empresa vinculada' }, { status: 403 });
      }
      targetEmpresaId = user.empresaId;
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const productos = await prisma.producto.findMany({
      where: {
        ...(targetEmpresaId ? { empresaId: targetEmpresaId } : {}),
        activo: true,
      },
      include: {
        empresa: { select: { id: true, nombre: true } },
        detallesInventario: {
          include: {
            inventarioRegistro: {
              select: { fecha: true, tienda: { select: { nombre: true } } },
            },
          },
          orderBy: {
            inventarioRegistro: { fecha: 'desc' },
          },
          take: 20,
        },
      },
      orderBy: { nombre: 'asc' },
    });

    const metrics = productos.map((p) => {
      const conteos = p.detallesInventario.map((d) => d.cantidadFisica);
      const totalColocado = conteos.reduce((a, b) => a + b, 0);
      const promedio = conteos.length > 0 ? Math.round(totalColocado / conteos.length) : 0;
      const ultimoConteo = conteos.length > 0 ? conteos[0] : 0;

      // Determinación de rotación según volumen y actividad
      let rotacion: 'ALTA' | 'MEDIA' | 'BAJA' = 'MEDIA';
      if (promedio >= 30) {
        rotacion = 'ALTA';
      } else if (promedio <= 10) {
        rotacion = 'BAJA';
      }

      return {
        productoId: p.id,
        nombre: p.nombre,
        codigoU: p.codigoU,
        codigoBarras: p.codigoBarras,
        imagenUrl: p.imagenUrl,
        empresaNombre: p.empresa.nombre,
        totalConteosRegistrados: conteos.length,
        totalPiezasEncontradas: totalColocado,
        promedioPorTienda: promedio,
        ultimoConteo,
        rotacion,
        historialReciente: p.detallesInventario.slice(0, 7).map((d) => ({
          fecha: d.inventarioRegistro.fecha,
          tienda: d.inventarioRegistro.tienda.nombre,
          cantidad: d.cantidadFisica,
        })),
      };
    });

    // Clasificar por rotación
    const altaRotacion = metrics.filter((m) => m.rotacion === 'ALTA');
    const mediaRotacion = metrics.filter((m) => m.rotacion === 'MEDIA');
    const bajaRotacion = metrics.filter((m) => m.rotacion === 'BAJA');

    return NextResponse.json({
      success: true,
      resumen: {
        totalProductos: metrics.length,
        altaRotacion: altaRotacion.length,
        mediaRotacion: mediaRotacion.length,
        bajaRotacion: bajaRotacion.length,
      },
      productos: metrics,
    });
  } catch (error: any) {
    console.error('Error en GET /api/empresa/reportes/comportamiento:', error);
    return NextResponse.json({ error: 'Error al generar reporte de comportamiento' }, { status: 500 });
  }
}
