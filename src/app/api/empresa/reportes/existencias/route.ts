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
    const productoId = searchParams.get('productoId') || '';
    let targetEmpresaId = searchParams.get('empresaId') || '';

    // Aislamiento estricto de datos por empresa
    if (user.role === 'EMPRESA') {
      if (!user.empresaId) {
        return NextResponse.json({ error: 'Usuario de empresa sin empresa vinculada' }, { status: 403 });
      }
      targetEmpresaId = user.empresaId;
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado a reportes' }, { status: 403 });
    }

    // Obtener catálogo de productos de la empresa
    const productos = await prisma.producto.findMany({
      where: {
        ...(targetEmpresaId ? { empresaId: targetEmpresaId } : {}),
        ...(productoId ? { id: productoId } : {}),
        activo: true,
      },
      include: {
        empresa: { select: { id: true, nombre: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    // Obtener las tiendas activas
    const tiendas = await prisma.tienda.findMany({
      where: {
        ...(tiendaId ? { id: tiendaId } : {}),
        activa: true,
      },
      orderBy: { nombre: 'asc' },
    });

    // Para cada producto y tienda, calcular la última existencia registrada
    const existencias: any[] = [];

    for (const prod of productos) {
      for (const t of tiendas) {
        // Buscar el último registro de inventario para este producto y tienda
        const ultimoDetalle = await prisma.inventarioDetalle.findFirst({
          where: {
            productoId: prod.id,
            inventarioRegistro: {
              tiendaId: t.id,
              ...(targetEmpresaId ? { empresaId: targetEmpresaId } : {}),
            },
          },
          include: {
            inventarioRegistro: {
              select: {
                fecha: true,
                colocadora: { select: { nombre: true } },
              },
            },
          },
          orderBy: {
            inventarioRegistro: {
              fecha: 'desc',
            },
          },
        });

        existencias.push({
          productoId: prod.id,
          productoNombre: prod.nombre,
          codigoU: prod.codigoU,
          codigoBarras: prod.codigoBarras,
          imagenUrl: prod.imagenUrl,
          empresaId: prod.empresa.id,
          empresaNombre: prod.empresa.nombre,
          tiendaId: t.id,
          tiendaNombre: t.nombre,
          ciudad: t.ciudad,
          existenciaActual: ultimoDetalle ? ultimoDetalle.cantidadFisica : 0,
          ultimaActualizacion: ultimoDetalle ? ultimoDetalle.inventarioRegistro.fecha : null,
          colocadoraNombre: ultimoDetalle ? ultimoDetalle.inventarioRegistro.colocadora.nombre : null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      existencias,
      totalRegistros: existencias.length,
    });
  } catch (error: any) {
    console.error('Error en GET /api/empresa/reportes/existencias:', error);
    return NextResponse.json({ error: 'Error al generar reporte de existencias' }, { status: 500 });
  }
}
