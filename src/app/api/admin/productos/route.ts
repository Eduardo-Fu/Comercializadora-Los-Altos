import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createProductoSchema = z.object({
  nombre: z.string().min(2, 'El nombre del producto es requerido'),
  codigoU: z.string().min(1, 'El Código U (interno) es requerido'),
  codigoBarras: z.string().min(1, 'El código de barras es requerido'),
  imagenUrl: z.string().optional(),
  empresaId: z.string().min(1, 'La empresa proveedora es requerida'),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const empresaId = searchParams.get('empresaId') || '';

    const where: any = {
      activo: true,
      OR: [
        { nombre: { contains: search, mode: 'insensitive' } },
        { codigoU: { contains: search, mode: 'insensitive' } },
        { codigoBarras: { contains: search, mode: 'insensitive' } },
      ],
    };

    if (empresaId) {
      where.empresaId = empresaId;
    }

    const productos = await prisma.producto.findMany({
      where,
      include: {
        empresa: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, productos });
  } catch (error: any) {
    console.error('Error en GET /api/admin/productos:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createProductoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de producto inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { nombre, codigoU, codigoBarras, imagenUrl, empresaId } = parsed.data;

    // Validar existencia de la empresa
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
    });
    if (!empresa) {
      return NextResponse.json({ error: 'La empresa especificada no existe' }, { status: 400 });
    }

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        codigoU,
        codigoBarras,
        imagenUrl: imagenUrl || null,
        empresaId,
        activo: true,
      },
      include: {
        empresa: { select: { id: true, nombre: true } },
      },
    });

    return NextResponse.json({ success: true, producto: nuevoProducto }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/productos:', error);
    return NextResponse.json({ error: 'Error al crear producto: ' + error.message }, { status: 500 });
  }
}
