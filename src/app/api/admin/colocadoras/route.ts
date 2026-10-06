import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createColocadoraSchema = z.object({
  nombre: z.string().min(2, 'El nombre de la colocadora es requerido'),
  dpi: z
    .string()
    .regex(/^\d+$/, 'El DPI debe contener únicamente números')
    .min(10, 'El DPI debe tener al menos 10 dígitos'),
  fechaContratacion: z.string().min(1, 'La fecha de contratación es requerida'),
  tiendasIds: z.array(z.string()).min(1, 'Debe asignar al menos una tienda'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const estado = searchParams.get('estado') || '';

    const where: any = {
      OR: [
        { nombre: { contains: search, mode: 'insensitive' } },
        { dpi: { contains: search } },
      ],
    };

    if (estado === 'ACTIVA' || estado === 'INACTIVA') {
      where.estado = estado;
    }

    const colocadoras = await prisma.colocadoraProfile.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, activo: true } },
        tiendasAsignadas: {
          include: {
            tienda: { select: { id: true, nombre: true, ciudad: true } },
          },
        },
        _count: {
          select: {
            inventarios: true,
            mermas: true,
            vencimientos: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, colocadoras });
  } catch (error: any) {
    console.error('Error en GET /api/admin/colocadoras:', error);
    return NextResponse.json({ error: 'Error al obtener colocadoras' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createColocadoraSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de colocadora inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { nombre, dpi, fechaContratacion, tiendasIds, email, password } = parsed.data;

    // 1. Validar que el DPI no esté ya registrado
    const existingDpi = await prisma.colocadoraProfile.findUnique({
      where: { dpi },
    });
    if (existingDpi) {
      return NextResponse.json(
        { error: 'Ya existe una colocadora registrada con ese DPI' },
        { status: 400 }
      );
    }

    // 2. Validar que el email no esté registrado
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado para otro usuario' },
        { status: 400 }
      );
    }

    // 3. Crear usuario y perfil en una transacción
    const passwordHash = await hashPassword(password);

    const resultado = await prisma.$transaction(async (tx) => {
      // Crear cuenta de usuario con rol COLOCADORA
      const nuevoUsuario = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name: nombre,
          role: 'COLOCADORA',
          activo: true,
        },
      });

      // Crear perfil de colocadora
      const nuevoPerfil = await tx.colocadoraProfile.create({
        data: {
          userId: nuevoUsuario.id,
          nombre,
          dpi,
          fechaContratacion: new Date(fechaContratacion),
          estado: 'ACTIVA',
        },
      });

      // Asignar tiendas
      if (tiendasIds.length > 0) {
        await tx.colocadoraTienda.createMany({
          data: tiendasIds.map((tiendaId) => ({
            colocadoraId: nuevoPerfil.id,
            tiendaId,
          })),
        });
      }

      return nuevoPerfil;
    });

    const colocadoraCompleta = await prisma.colocadoraProfile.findUnique({
      where: { id: resultado.id },
      include: {
        user: { select: { id: true, email: true } },
        tiendasAsignadas: { include: { tienda: true } },
      },
    });

    return NextResponse.json({ success: true, colocadora: colocadoraCompleta }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/colocadoras:', error);
    return NextResponse.json(
      { error: 'Error al registrar contratación de colocadora: ' + error.message },
      { status: 500 }
    );
  }
}
