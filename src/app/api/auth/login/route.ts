import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de inicio de sesión inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        colocadoraProfile: true,
        empresaProfile: true,
      },
    });

    if (!user || !user.activo) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas o usuario inactivo' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Crear token JWT con información de rol
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      colocadoraId: user.colocadoraProfile?.id,
      empresaId: user.empresaProfile?.id,
    });

    // Determinar ruta de redirección por defecto
    let redirectUrl = '/admin';
    if (user.role === 'COLOCADORA') redirectUrl = '/colocadora';
    if (user.role === 'EMPRESA') redirectUrl = '/empresa';

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectUrl,
    });

    // Guardar cookie HTTP-Only segura
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error en /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Error interno en el servidor de autenticación' },
      { status: 500 }
    );
  }
}
