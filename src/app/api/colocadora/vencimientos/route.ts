import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const vencimientoSchema = z.object({
  empresaId: z.string().min(1, 'La empresa es requerida'),
  tiendaId: z.string().min(1, 'La tienda es requerida'),
  productoId: z.string().min(1, 'El producto es requerido'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0').default(1),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get('empresaId');

    const where: any = {};
    if (user.role === 'COLOCADORA') {
      const profile = await prisma.colocadoraProfile.findUnique({
        where: { userId: user.userId },
      });
      if (profile) where.colocadoraId = profile.id;
    }
    if (empresaId) where.empresaId = empresaId;

    const vencimientos = await prisma.vencimientoRegistro.findMany({
      where,
      include: {
        empresa: { select: { id: true, nombre: true } },
        tienda: { select: { id: true, nombre: true, ciudad: true } },
        producto: { select: { id: true, nombre: true, codigoU: true, codigoBarras: true, imagenUrl: true } },
        colocadora: { select: { id: true, nombre: true } },
      },
      orderBy: { fechaVencimiento: 'asc' },
      take: 50,
    });

    return NextResponse.json({ success: true, vencimientos });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener vencimientos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = vencimientoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de vencimiento inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { empresaId, tiendaId, productoId, fechaVencimiento, cantidad } = parsed.data;

    let colocadoraId: string | undefined = undefined;

    if (user.role === 'COLOCADORA') {
      const profile = await prisma.colocadoraProfile.findUnique({
        where: { userId: user.userId },
      });
      if (!profile || profile.estado !== 'ACTIVA') {
        return NextResponse.json({ error: 'Perfil de colocadora no activo' }, { status: 403 });
      }
      colocadoraId = profile.id;
    } else if (user.role === 'ADMIN') {
      const firstColocadora = await prisma.colocadoraProfile.findFirst({
        where: { estado: 'ACTIVA' },
      });
      if (firstColocadora) colocadoraId = firstColocadora.id;
    }

    const registro = await prisma.vencimientoRegistro.create({
      data: {
        empresaId,
        tiendaId,
        productoId,
        colocadoraId,
        fechaVencimiento: new Date(fechaVencimiento),
        cantidad,
      },
      include: {
        empresa: true,
        tienda: true,
        producto: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Fecha de vencimiento registrada exitosamente',
        registro,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en POST /api/colocadora/vencimientos:', error);
    return NextResponse.json(
      { error: 'Error al registrar fecha de vencimiento: ' + error.message },
      { status: 500 }
    );
  }
}
