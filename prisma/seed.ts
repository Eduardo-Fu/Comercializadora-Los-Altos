import { PrismaClient, Role, EstadoColaborador } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seed)...');

  // 1. Password hash común para entorno de desarrollo
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const colocadoraPassword = await bcrypt.hash('colocadora123', salt);
  const empresaPassword = await bcrypt.hash('empresa123', salt);

  // 2. Crear Usuario Administrador
  const admin = await prisma.user.upsert({
    where: { email: 'admin@losaltos.com' },
    update: {},
    create: {
      email: 'admin@losaltos.com',
      passwordHash: adminPassword,
      name: 'Rodrigo López (Administrador)',
      role: Role.ADMIN,
      activo: true,
    },
  });
  console.log('✅ Usuario Administrador creado:', admin.email);

  // 3. Crear Supermercados / Tiendas
  const tiendasData = [
    { nombre: 'Supermercado Gran Gallo - Central', ciudad: 'Guatemala', direccion: 'Zona 1' },
    { nombre: 'Supermercado Más y Más - Fraijanes', ciudad: 'Fraijanes', direccion: 'km 19.5 carretera a Pavón' },
    { nombre: 'Supermercado Espiga de Oro', ciudad: 'Guatemala', direccion: 'Zona 10' },
    { nombre: 'La Estrella Malacatán', ciudad: 'Malacatán', direccion: 'San Marcos' },
  ];

  const tiendas = [];
  for (const t of tiendasData) {
    const tienda = await prisma.tienda.create({
      data: t,
    });
    tiendas.push(tienda);
  }
  console.log(`✅ ${tiendas.length} Supermercados creados.`);

  // 4. Crear Empresas / Marcas Proveedoras
  const userEmpresa = await prisma.user.upsert({
    where: { email: 'irex@comercializadoralosaltos.com' },
    update: {},
    create: {
      email: 'irex@comercializadoralosaltos.com',
      passwordHash: empresaPassword,
      name: 'Representante Irex',
      role: Role.EMPRESA,
      activo: true,
    },
  });

  const empresaIrex = await prisma.empresa.upsert({
    where: { nombre: 'Irex de Guatemala' },
    update: {},
    create: {
      nombre: 'Irex de Guatemala',
      contacto: 'Departamento de Ventas',
      telefono: '59000136',
      email: 'irex@comercializadoralosaltos.com',
      userId: userEmpresa.id,
      activo: true,
    },
  });

  const empresaLosAltos = await prisma.empresa.upsert({
    where: { nombre: 'Comercializadora Los Altos (Propia)' },
    update: {},
    create: {
      nombre: 'Comercializadora Los Altos (Propia)',
      contacto: 'Rodrigo López',
      telefono: '56530296',
      email: 'comercializadoralosaltos@gmail.com',
      activo: true,
    },
  });
  console.log('✅ Empresas creadas:', empresaIrex.nombre, ',', empresaLosAltos.nombre);

  // 5. Crear Productos de Demostración
  const productosData = [
    {
      nombre: 'Detergente Orix Floral 1kg',
      codigoU: 'ORX-101',
      codigoBarras: '740100234001',
      imagenUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
      empresaId: empresaIrex.id,
    },
    {
      nombre: 'Limpiador Multiuso Irex Lavanda 750ml',
      codigoU: 'IRX-205',
      codigoBarras: '740100234002',
      imagenUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80',
      empresaId: empresaIrex.id,
    },
    {
      nombre: 'Chile Cobán Molido Los Altos 100g',
      codigoU: 'ALT-301',
      codigoBarras: '740200112001',
      imagenUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
      empresaId: empresaLosAltos.id,
    },
    {
      nombre: 'Canela en Polvo Los Altos 50g',
      codigoU: 'ALT-302',
      codigoBarras: '740200112002',
      imagenUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&q=80',
      empresaId: empresaLosAltos.id,
    },
  ];

  for (const p of productosData) {
    await prisma.producto.create({
      data: p,
    });
  }
  console.log(`✅ ${productosData.length} Productos cargados en el catálogo.`);

  // 6. Crear Colocadora de Demostración
  const userColocadora = await prisma.user.upsert({
    where: { email: 'colocadora@losaltos.com' },
    update: {},
    create: {
      email: 'colocadora@losaltos.com',
      passwordHash: colocadoraPassword,
      name: 'María Gómez (Colocadora)',
      role: Role.COLOCADORA,
      activo: true,
    },
  });

  const colocadoraProfile = await prisma.colocadoraProfile.upsert({
    where: { userId: userColocadora.id },
    update: {},
    create: {
      userId: userColocadora.id,
      nombre: 'María Gómez',
      dpi: '2987123450101',
      fechaContratacion: new Date('2025-01-15'),
      estado: EstadoColaborador.ACTIVA,
    },
  });

  // Asignar tiendas a la colocadora
  await prisma.colocadoraTienda.createMany({
    data: [
      { colocadoraId: colocadoraProfile.id, tiendaId: tiendas[0].id },
      { colocadoraId: colocadoraProfile.id, tiendaId: tiendas[1].id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Perfil de Colocadora creado y tiendas asignadas:', colocadoraProfile.nombre);
  console.log('🎉 Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
