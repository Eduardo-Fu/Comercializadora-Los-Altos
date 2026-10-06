import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createEmpresaSchema = z.object({
  nombre: z.string().min(2, 'El nombre de la empresa es requerido'),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  createUserAccount: z.boolean().optional(),
  userPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const empresas = await prisma.empresa.findMany({
      where: {
        nombre: { contains: search, mode: 'insensitive' },
      },
      include: {
        user: { select: { id: true, email: true, name: true, activo: true } },
        _count: {
          select: {
            productos: true,
            inventarios: true,
            mermas: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, empresas });
  } catch (error: any) {
    console.error('Error en GET /api/admin/empresas:', error);
    return NextResponse.json({ error: 'Error al obtener empresas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createEmpresaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de empresa inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { nombre, contacto, telefono, email, createUserAccount, userPassword } = parsed.data;

    // Validar nombre único
    const existing = await prisma.empresa.findUnique({
      where: { nombre },
    });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una empresa registrada con ese nombre' }, { status: 400 });
    }

    let createdUserId: string | undefined = undefined;

    // Si se solicitó crear cuenta de usuario para la empresa
    if (createUserAccount && email && userPassword) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'El correo electrónico ya está registrado para otro usuario' },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(userPassword);
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name: contacto || nombre,
          role: 'EMPRESA',
          activo: true,
        },
      });
      createdUserId = newUser.id;
    }

    const nuevaEmpresa = await prisma.empresa.create({
      data: {
        nombre,
        contacto: contacto || null,
        telefono: telefono || null,
        email: email || null,
        userId: createdUserId,
        activo: true,
      },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, empresa: nuevaEmpresa }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/empresas:', error);
    return NextResponse.json({ error: 'Error al registrar empresa: ' + error.message }, { status: 500 });
  }
}
