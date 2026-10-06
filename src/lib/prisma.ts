// In-memory mock Prisma database client for AI Studio preview environment
// Allows all dashboard features, roles (ADMIN, COLOCADORA, EMPRESA),
// authentication, inventory, expirations, and suggestions to function immediately.

interface StoreData {
  users: any[];
  colocadoraProfiles: any[];
  empresas: any[];
  tiendas: any[];
  colocadoraTiendas: any[];
  productos: any[];
  inventarioRegistros: any[];
  inventarioDetalles: any[];
  productoMalEstados: any[];
  vencimientoRegistros: any[];
  sugeridoRegistros: any[];
}

const globalForStore = globalThis as unknown as {
  __LOS_ALTOS_STORE__?: StoreData;
};

function initStore(): StoreData {
  const users = [
    {
      id: 'usr_admin_1',
      email: 'admin@losaltos.com',
      passwordHash: '$2a$10$4STtTlmZuTCFn3Kgc/BnwuAEl45E99o92gTIFF5ghQsQMj26PzswS', // admin123
      name: 'Rodrigo López (Administrador)',
      role: 'ADMIN',
      activo: true,
      createdAt: new Date('2025-01-01T08:00:00Z'),
      updatedAt: new Date('2025-01-01T08:00:00Z'),
    },
    {
      id: 'usr_colocadora_1',
      email: 'colocadora@losaltos.com',
      passwordHash: '$2a$10$P3vhFZPlP65IXzM/gQAWg.YtJtziWeEk8A3SnrVWUtqXj/W47Ha1i', // colocadora123
      name: 'María Gómez (Colocadora)',
      role: 'COLOCADORA',
      activo: true,
      createdAt: new Date('2025-01-15T08:00:00Z'),
      updatedAt: new Date('2025-01-15T08:00:00Z'),
    },
    {
      id: 'usr_empresa_1',
      email: 'irex@comercializadoralosaltos.com',
      passwordHash: '$2a$10$zaXV29T./sqCqUYiIi0sZeXCwWmmEzfv7CK7KdNdhddPJ5ulGWyXK', // empresa123
      name: 'Representante Irex',
      role: 'EMPRESA',
      activo: true,
      createdAt: new Date('2025-01-05T08:00:00Z'),
      updatedAt: new Date('2025-01-05T08:00:00Z'),
    },
  ];

  const colocadoraProfiles = [
    {
      id: 'coloc_1',
      userId: 'usr_colocadora_1',
      nombre: 'María Gómez',
      dpi: '2987123450101',
      fechaContratacion: new Date('2025-01-15T00:00:00Z'),
      estado: 'ACTIVA',
      motivoBaja: null,
      fechaBaja: null,
      createdAt: new Date('2025-01-15T08:00:00Z'),
      updatedAt: new Date('2025-01-15T08:00:00Z'),
    },
  ];

  const empresas = [
    {
      id: 'emp_1',
      nombre: 'Irex de Guatemala',
      contacto: 'Departamento de Ventas',
      telefono: '59000136',
      email: 'irex@comercializadoralosaltos.com',
      userId: 'usr_empresa_1',
      activo: true,
      createdAt: new Date('2025-01-05T08:00:00Z'),
      updatedAt: new Date('2025-01-05T08:00:00Z'),
    },
    {
      id: 'emp_2',
      nombre: 'Comercializadora Los Altos (Propia)',
      contacto: 'Rodrigo López',
      telefono: '56530296',
      email: 'comercializadoralosaltos@gmail.com',
      userId: null,
      activo: true,
      createdAt: new Date('2025-01-01T08:00:00Z'),
      updatedAt: new Date('2025-01-01T08:00:00Z'),
    },
  ];

  const tiendas = [
    {
      id: 'td_1',
      nombre: 'Supermercado Gran Gallo - Central',
      ciudad: 'Guatemala',
      direccion: 'Zona 1',
      activa: true,
      createdAt: new Date('2025-01-01T08:00:00Z'),
      updatedAt: new Date('2025-01-01T08:00:00Z'),
    },
    {
      id: 'td_2',
      nombre: 'Supermercado Más y Más - Fraijanes',
      ciudad: 'Fraijanes',
      direccion: 'km 19.5 carretera a Pavón',
      activa: true,
      createdAt: new Date('2025-01-01T08:00:00Z'),
      updatedAt: new Date('2025-01-01T08:00:00Z'),
    },
    {
      id: 'td_3',
      nombre: 'Supermercado Espiga de Oro',
      ciudad: 'Guatemala',
      direccion: 'Zona 10',
      activa: true,
      createdAt: new Date('2025-01-01T08:00:00Z'),
      updatedAt: new Date('2025-01-01T08:00:00Z'),
    },
    {
      id: 'td_4',
      nombre: 'La Estrella Malacatán',
      ciudad: 'Malacatán',
      direccion: 'San Marcos',
      activa: true,
      createdAt: new Date('2025-01-01T08:00:00Z'),
      updatedAt: new Date('2025-01-01T08:00:00Z'),
    },
  ];

  const colocadoraTiendas = [
    {
      id: 'ct_1',
      colocadoraId: 'coloc_1',
      tiendaId: 'td_1',
      asignadoEn: new Date('2025-01-16T08:00:00Z'),
    },
    {
      id: 'ct_2',
      colocadoraId: 'coloc_1',
      tiendaId: 'td_2',
      asignadoEn: new Date('2025-01-16T08:00:00Z'),
    },
  ];

  const productos = [
    {
      id: 'prod_1',
      nombre: 'Detergente Orix Floral 1kg',
      codigoU: 'ORX-101',
      codigoBarras: '740100234001',
      imagenUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
      empresaId: 'emp_1',
      activo: true,
      createdAt: new Date('2025-01-10T08:00:00Z'),
      updatedAt: new Date('2025-01-10T08:00:00Z'),
    },
    {
      id: 'prod_2',
      nombre: 'Limpiador Multiuso Irex Lavanda 750ml',
      codigoU: 'IRX-205',
      codigoBarras: '740100234002',
      imagenUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80',
      empresaId: 'emp_1',
      activo: true,
      createdAt: new Date('2025-01-10T08:00:00Z'),
      updatedAt: new Date('2025-01-10T08:00:00Z'),
    },
    {
      id: 'prod_3',
      nombre: 'Chile Cobán Molido Los Altos 100g',
      codigoU: 'ALT-301',
      codigoBarras: '740200112001',
      imagenUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
      empresaId: 'emp_2',
      activo: true,
      createdAt: new Date('2025-01-10T08:00:00Z'),
      updatedAt: new Date('2025-01-10T08:00:00Z'),
    },
    {
      id: 'prod_4',
      nombre: 'Canela en Polvo Los Altos 50g',
      codigoU: 'ALT-302',
      codigoBarras: '740200112002',
      imagenUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&q=80',
      empresaId: 'emp_2',
      activo: true,
      createdAt: new Date('2025-01-10T08:00:00Z'),
      updatedAt: new Date('2025-01-10T08:00:00Z'),
    },
  ];

  const inventarioRegistros = [
    {
      id: 'inv_1',
      fecha: new Date(Date.now() - 86400000 * 2),
      colocadoraId: 'coloc_1',
      tiendaId: 'td_1',
      empresaId: 'emp_1',
      observaciones: 'Inventario matutino en góndola principal',
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: 'inv_2',
      fecha: new Date(Date.now() - 86400000),
      colocadoraId: 'coloc_1',
      tiendaId: 'td_2',
      empresaId: 'emp_2',
      observaciones: 'Revisión semanal en pasillo 4',
      createdAt: new Date(Date.now() - 86400000),
    },
  ];

  const inventarioDetalles = [
    {
      id: 'inv_det_1',
      inventarioRegistroId: 'inv_1',
      productoId: 'prod_1',
      cantidadFisica: 48,
    },
    {
      id: 'inv_det_2',
      inventarioRegistroId: 'inv_1',
      productoId: 'prod_2',
      cantidadFisica: 32,
    },
    {
      id: 'inv_det_3',
      inventarioRegistroId: 'inv_2',
      productoId: 'prod_3',
      cantidadFisica: 60,
    },
    {
      id: 'inv_det_4',
      inventarioRegistroId: 'inv_2',
      productoId: 'prod_4',
      cantidadFisica: 75,
    },
  ];

  const productoMalEstados = [
    {
      id: 'merma_1',
      fecha: new Date(Date.now() - 86400000 * 3),
      empresaId: 'emp_1',
      colocadoraId: 'coloc_1',
      tiendaId: 'td_1',
      productoId: 'prod_1',
      imagenUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
      descripcion: 'Empaque roto durante descarga en bodega con pérdida parcial de polvo',
      createdAt: new Date(Date.now() - 86400000 * 3),
    },
  ];

  const vencimientoRegistros = [
    {
      id: 'venc_1',
      fechaRegistro: new Date(Date.now() - 86400000 * 5),
      fechaVencimiento: new Date(Date.now() + 86400000 * 20),
      empresaId: 'emp_1',
      colocadoraId: 'coloc_1',
      tiendaId: 'td_1',
      productoId: 'prod_2',
      cantidad: 12,
      createdAt: new Date(Date.now() - 86400000 * 5),
    },
    {
      id: 'venc_2',
      fechaRegistro: new Date(Date.now() - 86400000 * 2),
      fechaVencimiento: new Date(Date.now() + 86400000 * 45),
      empresaId: 'emp_2',
      colocadoraId: 'coloc_1',
      tiendaId: 'td_2',
      productoId: 'prod_3',
      cantidad: 8,
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
  ];

  const sugeridoRegistros = [
    {
      id: 'sug_1',
      fecha: new Date(Date.now() - 86400000),
      empresaId: 'emp_1',
      tiendaId: 'td_1',
      productoId: 'prod_1',
      cantidadSugerida: 24,
      notas: 'Alta rotación durante fin de semana largo',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: 'sug_2',
      fecha: new Date(Date.now() - 86400000 * 2),
      empresaId: 'emp_2',
      tiendaId: 'td_2',
      productoId: 'prod_4',
      cantidadSugerida: 15,
      notas: 'Stock en góndola menor al umbral de seguridad',
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
  ];

  return {
    users,
    colocadoraProfiles,
    empresas,
    tiendas,
    colocadoraTiendas,
    productos,
    inventarioRegistros,
    inventarioDetalles,
    productoMalEstados,
    vencimientoRegistros,
    sugeridoRegistros,
  };
}

if (!globalForStore.__LOS_ALTOS_STORE__) {
  globalForStore.__LOS_ALTOS_STORE__ = initStore();
}

const store = globalForStore.__LOS_ALTOS_STORE__;

function matchesFilter(item: any, where: any): boolean {
  if (!where) return true;
  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;
    if (key === 'OR' && Array.isArray(val)) {
      if (!val.some((subWhere) => matchesFilter(item, subWhere))) return false;
      continue;
    }
    if (key === 'AND' && Array.isArray(val)) {
      if (!val.every((subWhere) => matchesFilter(item, subWhere))) return false;
      continue;
    }
    if (val && typeof val === 'object' && !(val instanceof Date)) {
      const itemVal = item[key];
      if ('equals' in val && itemVal !== val.equals) return false;
      if ('not' in val && itemVal === val.not) return false;
      if ('in' in val && Array.isArray(val.in) && !val.in.includes(itemVal)) return false;
      if ('gte' in val) {
        const target = val.gte instanceof Date ? val.gte.getTime() : val.gte;
        const current = itemVal instanceof Date ? itemVal.getTime() : itemVal;
        if (current < target) return false;
      }
      if ('lte' in val) {
        const target = val.lte instanceof Date ? val.lte.getTime() : val.lte;
        const current = itemVal instanceof Date ? itemVal.getTime() : itemVal;
        if (current > target) return false;
      }
      if ('gt' in val) {
        const target = val.gt instanceof Date ? val.gt.getTime() : val.gt;
        const current = itemVal instanceof Date ? itemVal.getTime() : itemVal;
        if (current <= target) return false;
      }
      if ('lt' in val) {
        const target = val.lt instanceof Date ? val.lt.getTime() : val.lt;
        const current = itemVal instanceof Date ? itemVal.getTime() : itemVal;
        if (current >= target) return false;
      }
      continue;
    }
    if (val instanceof Date) {
      if (!(item[key] instanceof Date) || item[key].getTime() !== val.getTime()) return false;
      continue;
    }
    if (item[key] !== val) return false;
  }
  return true;
}

function resolveRelations(modelName: string, item: any, include: any): any {
  if (!item || !include) return item;
  const cloned = { ...item };

  if (modelName === 'user') {
    if (include.colocadoraProfile) {
      cloned.colocadoraProfile = store.colocadoraProfiles.find((cp) => cp.userId === item.id) ?? null;
    }
    if (include.empresaProfile) {
      cloned.empresaProfile = store.empresas.find((e) => e.userId === item.id) ?? null;
    }
  }

  if (modelName === 'colocadoraProfile') {
    if (include.user) {
      cloned.user = store.users.find((u) => u.id === item.userId) ?? null;
    }
    if (include.tiendasAsignadas) {
      const assigned = store.colocadoraTiendas.filter((ct) => ct.colocadoraId === item.id);
      cloned.tiendasAsignadas = assigned.map((ct) => {
        if (include.tiendasAsignadas?.include?.tienda) {
          return {
            ...ct,
            tienda: store.tiendas.find((t) => t.id === ct.tiendaId) ?? null,
          };
        }
        return ct;
      });
    }
  }

  if (modelName === 'colocadoraTienda') {
    if (include.tienda) {
      cloned.tienda = store.tiendas.find((t) => t.id === item.tiendaId) ?? null;
    }
    if (include.colocadora) {
      cloned.colocadora = store.colocadoraProfiles.find((cp) => cp.id === item.colocadoraId) ?? null;
    }
  }

  if (modelName === 'empresa') {
    if (include.user) {
      cloned.user = item.userId ? store.users.find((u) => u.id === item.userId) ?? null : null;
    }
    if (include._count?.select?.productos) {
      const pCount = store.productos.filter((p) => p.empresaId === item.id && p.activo !== false).length;
      cloned._count = { productos: pCount };
    }
    if (include.productos) {
      cloned.productos = store.productos.filter((p) => p.empresaId === item.id);
    }
  }

  if (modelName === 'producto') {
    if (include.empresa) {
      cloned.empresa = store.empresas.find((e) => e.id === item.empresaId) ?? null;
    }
  }

  if (modelName === 'tienda') {
    if (include.colocadoras) {
      const assigned = store.colocadoraTiendas.filter((ct) => ct.tiendaId === item.id);
      cloned.colocadoras = assigned.map((ct) => ({
        ...ct,
        colocadora: store.colocadoraProfiles.find((cp) => cp.id === ct.colocadoraId) ?? null,
      }));
    }
  }

  if (modelName === 'inventarioRegistro') {
    if (include.colocadora) {
      cloned.colocadora = store.colocadoraProfiles.find((c) => c.id === item.colocadoraId) ?? null;
    }
    if (include.tienda) {
      cloned.tienda = store.tiendas.find((t) => t.id === item.tiendaId) ?? null;
    }
    if (include.empresa) {
      cloned.empresa = store.empresas.find((e) => e.id === item.empresaId) ?? null;
    }
    if (include.detalles) {
      const details = store.inventarioDetalles.filter((d) => d.inventarioRegistroId === item.id);
      cloned.detalles = details.map((d) => {
        if (include.detalles?.include?.producto) {
          return {
            ...d,
            producto: store.productos.find((p) => p.id === d.productoId) ?? null,
          };
        }
        return d;
      });
    }
  }

  if (modelName === 'inventarioDetalle') {
    if (include.producto) {
      cloned.producto = store.productos.find((p) => p.id === item.productoId) ?? null;
    }
    if (include.inventarioRegistro) {
      cloned.inventarioRegistro = store.inventarioRegistros.find((ir) => ir.id === item.inventarioRegistroId) ?? null;
    }
  }

  if (modelName === 'productoMalEstado') {
    if (include.colocadora) {
      cloned.colocadora = store.colocadoraProfiles.find((c) => c.id === item.colocadoraId) ?? null;
    }
    if (include.tienda) {
      cloned.tienda = store.tiendas.find((t) => t.id === item.tiendaId) ?? null;
    }
    if (include.empresa) {
      cloned.empresa = store.empresas.find((e) => e.id === item.empresaId) ?? null;
    }
    if (include.producto) {
      cloned.producto = store.productos.find((p) => p.id === item.productoId) ?? null;
    }
  }

  if (modelName === 'vencimientoRegistro') {
    if (include.colocadora) {
      cloned.colocadora = store.colocadoraProfiles.find((c) => c.id === item.colocadoraId) ?? null;
    }
    if (include.tienda) {
      cloned.tienda = store.tiendas.find((t) => t.id === item.tiendaId) ?? null;
    }
    if (include.empresa) {
      cloned.empresa = store.empresas.find((e) => e.id === item.empresaId) ?? null;
    }
    if (include.producto) {
      cloned.producto = store.productos.find((p) => p.id === item.productoId) ?? null;
    }
  }

  if (modelName === 'sugeridoRegistro') {
    if (include.tienda) {
      cloned.tienda = store.tiendas.find((t) => t.id === item.tiendaId) ?? null;
    }
    if (include.empresa) {
      cloned.empresa = store.empresas.find((e) => e.id === item.empresaId) ?? null;
    }
    if (include.producto) {
      cloned.producto = store.productos.find((p) => p.id === item.productoId) ?? null;
    }
  }

  return cloned;
}

function createModelHandler(modelName: string, items: any[]) {
  return {
    findUnique: async (args?: { where: any; include?: any }) => {
      const found = items.find((item) => matchesFilter(item, args?.where));
      return found ? resolveRelations(modelName, found, args?.include) : null;
    },
    findFirst: async (args?: { where?: any; include?: any; orderBy?: any }) => {
      let filtered = items.filter((item) => matchesFilter(item, args?.where));
      if (args?.orderBy) {
        const [field, dir] = Object.entries(args.orderBy)[0] as [string, 'asc' | 'desc'];
        filtered.sort((a, b) => {
          const valA = a[field] instanceof Date ? a[field].getTime() : a[field];
          const valB = b[field] instanceof Date ? b[field].getTime() : b[field];
          return dir === 'desc' ? (valA > valB ? -1 : 1) : valA < valB ? -1 : 1;
        });
      }
      const first = filtered[0];
      return first ? resolveRelations(modelName, first, args?.include) : null;
    },
    findMany: async (args?: { where?: any; include?: any; orderBy?: any; take?: number }) => {
      let result = items.filter((item) => matchesFilter(item, args?.where));
      if (args?.orderBy) {
        const [field, dir] = Object.entries(args.orderBy)[0] as [string, 'asc' | 'desc'];
        result.sort((a, b) => {
          const valA = a[field] instanceof Date ? a[field].getTime() : a[field];
          const valB = b[field] instanceof Date ? b[field].getTime() : b[field];
          return dir === 'desc' ? (valA > valB ? -1 : 1) : valA < valB ? -1 : 1;
        });
      }
      if (args?.take && args.take > 0) {
        result = result.slice(0, args.take);
      }
      return result.map((item) => resolveRelations(modelName, item, args?.include));
    },
    create: async (args: { data: any; include?: any }) => {
      const id = args.data.id || `${modelName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date();
      const newItem = {
        ...args.data,
        id,
        createdAt: args.data.createdAt ?? now,
        updatedAt: args.data.updatedAt ?? now,
      };
      items.push(newItem);
      return resolveRelations(modelName, newItem, args.include);
    },
    createMany: async (args: { data: any[]; skipDuplicates?: boolean }) => {
      const now = new Date();
      const created = [];
      for (const d of args.data) {
        const id = d.id || `${modelName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newItem = { ...d, id, createdAt: d.createdAt ?? now, updatedAt: d.updatedAt ?? now };
        items.push(newItem);
        created.push(newItem);
      }
      return { count: created.length };
    },
    update: async (args: { where: any; data: any; include?: any }) => {
      const idx = items.findIndex((item) => matchesFilter(item, args.where));
      if (idx === -1) {
        throw new Error(`Record to update not found in ${modelName}`);
      }
      items[idx] = {
        ...items[idx],
        ...args.data,
        updatedAt: new Date(),
      };
      return resolveRelations(modelName, items[idx], args.include);
    },
    delete: async (args: { where: any }) => {
      const idx = items.findIndex((item) => matchesFilter(item, args.where));
      if (idx === -1) {
        throw new Error(`Record to delete not found in ${modelName}`);
      }
      const [deleted] = items.splice(idx, 1);
      return deleted;
    },
    deleteMany: async (args?: { where?: any }) => {
      const initialLen = items.length;
      if (!args?.where) {
        items.length = 0;
        return { count: initialLen };
      }
      const toKeep = items.filter((item) => !matchesFilter(item, args.where));
      const deletedCount = items.length - toKeep.length;
      items.length = 0;
      items.push(...toKeep);
      return { count: deletedCount };
    },
    count: async (args?: { where?: any }) => {
      if (!args?.where) return items.length;
      return items.filter((item) => matchesFilter(item, args.where)).length;
    },
    upsert: async (args: { where: any; update: any; create: any }) => {
      const existing = items.find((item) => matchesFilter(item, args.where));
      if (existing) {
        Object.assign(existing, args.update, { updatedAt: new Date() });
        return existing;
      }
      const id = args.create.id || `${modelName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newItem = {
        ...args.create,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      items.push(newItem);
      return newItem;
    },
  };
}

export const prisma: any = {
  user: createModelHandler('user', store.users),
  colocadoraProfile: createModelHandler('colocadoraProfile', store.colocadoraProfiles),
  empresa: createModelHandler('empresa', store.empresas),
  tienda: createModelHandler('tienda', store.tiendas),
  colocadoraTienda: createModelHandler('colocadoraTienda', store.colocadoraTiendas),
  producto: createModelHandler('producto', store.productos),
  inventarioRegistro: createModelHandler('inventarioRegistro', store.inventarioRegistros),
  inventarioDetalle: createModelHandler('inventarioDetalle', store.inventarioDetalles),
  productoMalEstado: createModelHandler('productoMalEstado', store.productoMalEstados),
  vencimientoRegistro: createModelHandler('vencimientoRegistro', store.vencimientoRegistros),
  sugeridoRegistro: createModelHandler('sugeridoRegistro', store.sugeridoRegistros),
  $transaction: async (arg: any) => {
    if (typeof arg === 'function') {
      return arg(prisma);
    }
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    return arg;
  },
};
