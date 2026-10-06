import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      activo: true,
      colocadoraProfile: {
        select: {
          id: true,
          dpi: true,
          nombre: true,
          estado: true,
          tiendasAsignadas: {
            include: { tienda: true },
          },
        },
      },
      empresaProfile: {
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
        },
      },
    },
  });

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
