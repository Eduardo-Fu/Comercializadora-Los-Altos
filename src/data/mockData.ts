export type Role = 'ADMIN' | 'COLOCADORA' | 'EMPRESA';
export type EstadoColaborador = 'ACTIVA' | 'INACTIVA';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  colocadoraId?: string;
  empresaId?: string;
}

export interface Colocadora {
  id: string;
  nombre: string;
  dpi: string;
  fechaContratacion: string;
  estado: EstadoColaborador;
  tiendasAsignadas: string[];
  email: string;
  password?: string;
  motivoBaja?: string | null;
  fechaBaja?: string | null;
}

export interface Empresa {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  activa: boolean;
}

export interface Tienda {
  id: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  activa: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  codigoU: string;
  codigoBarras: string;
  empresaId: string;
  activo: boolean;
  imagenUrl?: string;
}

export interface InventarioDetalle {
  productoId: string;
  cantidadFisica: number;
}

export interface InventarioRegistro {
  id: string;
  fecha: string;
  colocadoraId: string;
  tiendaId: string;
  empresaId: string;
  observaciones?: string;
  detalles: InventarioDetalle[];
}

export interface MermaRegistro {
  id: string;
  fecha: string;
  colocadoraId: string;
  tiendaId: string;
  empresaId: string;
  productoId: string;
  imagenUrl: string;
  descripcion: string;
}

export interface VencimientoRegistro {
  id: string;
  fechaRegistro: string;
  fechaVencimiento: string;
  colocadoraId: string;
  tiendaId: string;
  empresaId: string;
  productoId: string;
  cantidad: number;
}

export interface SugeridoRegistro {
  id: string;
  fecha: string;
  tiendaId: string;
  empresaId: string;
  productoId: string;
  cantidadSugerida: number;
  notas?: string;
}

const STORAGE_KEY = 'LOS_ALTOS_APP_STORAGE_V1';

export interface AppState {
  currentUser: User | null;
  colocadoras: Colocadora[];
  empresas: Empresa[];
  tiendas: Tienda[];
  productos: Producto[];
  inventarios: InventarioRegistro[];
  mermas: MermaRegistro[];
  vencimientos: VencimientoRegistro[];
  sugeridos: SugeridoRegistro[];
}

const initialColocadoras: Colocadora[] = [
  {
    id: 'coloc_1',
    nombre: 'María Gómez',
    dpi: '2987123450101',
    fechaContratacion: '2025-01-15',
    estado: 'ACTIVA',
    tiendasAsignadas: ['td_1', 'td_2'],
    email: 'colocadora@losaltos.com',
  },
];

const initialEmpresas: Empresa[] = [
  {
    id: 'emp_1',
    nombre: 'Irex de Guatemala',
    contacto: 'Departamento de Ventas',
    telefono: '5900-0136',
    email: 'irex@comercializadoralosaltos.com',
    activa: true,
  },
  {
    id: 'emp_2',
    nombre: 'Comercializadora Los Altos (Propia)',
    contacto: 'Rodrigo López',
    telefono: '5653-0296',
    email: 'comercializadoralosaltos@gmail.com',
    activa: true,
  },
];

const initialTiendas: Tienda[] = [
  {
    id: 'td_1',
    nombre: 'Supermercado Gran Gallo - Central',
    ciudad: 'Ciudad de Guatemala',
    direccion: 'Zona 1, 4ta Avenida 8-12',
    activa: true,
  },
  {
    id: 'td_2',
    nombre: 'Supermercado Más y Más - Fraijanes',
    ciudad: 'Fraijanes',
    direccion: 'Km 19.5 Carretera a Pavón',
    activa: true,
  },
  {
    id: 'td_3',
    nombre: 'Supermercado Espiga de Oro',
    ciudad: 'Ciudad de Guatemala',
    direccion: 'Zona 10, Diagonal 6',
    activa: true,
  },
  {
    id: 'td_4',
    nombre: 'La Estrella Malacatán',
    ciudad: 'Malacatán, San Marcos',
    direccion: 'Barrio San Antonio',
    activa: true,
  },
];

const initialProductos: Producto[] = [
  {
    id: 'prod_1',
    nombre: 'Detergente Orix Floral 1kg',
    codigoU: 'ORX-101',
    codigoBarras: '740100234001',
    empresaId: 'emp_1',
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
  },
  {
    id: 'prod_2',
    nombre: 'Limpiador Multiuso Irex Lavanda 750ml',
    codigoU: 'IRX-205',
    codigoBarras: '740100234002',
    empresaId: 'emp_1',
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80',
  },
  {
    id: 'prod_3',
    nombre: 'Chile Cobán Molido Los Altos 100g',
    codigoU: 'ALT-301',
    codigoBarras: '740200112001',
    empresaId: 'emp_2',
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  },
  {
    id: 'prod_4',
    nombre: 'Canela en Polvo Los Altos 50g',
    codigoU: 'ALT-302',
    codigoBarras: '740200112002',
    empresaId: 'emp_2',
    activo: true,
    imagenUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&q=80',
  },
];

const initialInventarios: InventarioRegistro[] = [
  {
    id: 'inv_1',
    fecha: '2026-03-28',
    colocadoraId: 'coloc_1',
    tiendaId: 'td_1',
    empresaId: 'emp_1',
    observaciones: 'Inventario matutino en góndola principal',
    detalles: [
      { productoId: 'prod_1', cantidadFisica: 48 },
      { productoId: 'prod_2', cantidadFisica: 32 },
    ],
  },
  {
    id: 'inv_2',
    fecha: '2026-03-29',
    colocadoraId: 'coloc_1',
    tiendaId: 'td_2',
    empresaId: 'emp_2',
    observaciones: 'Revisión semanal en pasillo de especias',
    detalles: [
      { productoId: 'prod_3', cantidadFisica: 60 },
      { productoId: 'prod_4', cantidadFisica: 75 },
    ],
  },
];

const initialMermas: MermaRegistro[] = [
  {
    id: 'merma_1',
    fecha: '2026-03-27',
    colocadoraId: 'coloc_1',
    tiendaId: 'td_1',
    empresaId: 'emp_1',
    productoId: 'prod_1',
    imagenUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
    descripcion: 'Empaque roto durante descarga en bodega con pérdida parcial de polvo',
  },
];

const initialVencimientos: VencimientoRegistro[] = [
  {
    id: 'venc_1',
    fechaRegistro: '2026-03-25',
    fechaVencimiento: '2026-04-18',
    colocadoraId: 'coloc_1',
    tiendaId: 'td_1',
    empresaId: 'emp_1',
    productoId: 'prod_2',
    cantidad: 12,
  },
  {
    id: 'venc_2',
    fechaRegistro: '2026-03-28',
    fechaVencimiento: '2026-05-15',
    colocadoraId: 'coloc_1',
    tiendaId: 'td_2',
    empresaId: 'emp_2',
    productoId: 'prod_3',
    cantidad: 8,
  },
];

const initialSugeridos: SugeridoRegistro[] = [
  {
    id: 'sug_1',
    fecha: '2026-03-29',
    tiendaId: 'td_1',
    empresaId: 'emp_1',
    productoId: 'prod_1',
    cantidadSugerida: 24,
    notas: 'Alta rotación durante fin de semana largo',
  },
  {
    id: 'sug_2',
    fecha: '2026-03-27',
    tiendaId: 'td_2',
    empresaId: 'emp_2',
    productoId: 'prod_4',
    cantidadSugerida: 15,
    notas: 'Stock en góndola menor al umbral de seguridad',
  },
];

export function loadInitialState(): AppState {
  if (typeof window === 'undefined') {
    return {
      currentUser: null,
      colocadoras: initialColocadoras,
      empresas: initialEmpresas,
      tiendas: initialTiendas,
      productos: initialProductos,
      inventarios: initialInventarios,
      mermas: initialMermas,
      vencimientos: initialVencimientos,
      sugeridos: initialSugeridos,
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        currentUser: parsed.currentUser || {
          id: 'usr_admin',
          email: 'admin@losaltos.com',
          name: 'Rodrigo López (Administrador)',
          role: 'ADMIN',
        },
      };
    }
  } catch (e) {
    console.warn('Error loading storage, resetting to defaults', e);
  }

  // Default to Admin logged in for instant preview
  const defaultState: AppState = {
    currentUser: {
      id: 'usr_admin',
      email: 'admin@losaltos.com',
      name: 'Rodrigo López (Administrador)',
      role: 'ADMIN',
    },
    colocadoras: initialColocadoras,
    empresas: initialEmpresas,
    tiendas: initialTiendas,
    productos: initialProductos,
    inventarios: initialInventarios,
    mermas: initialMermas,
    vencimientos: initialVencimientos,
    sugeridos: initialSugeridos,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  } catch (e) {}

  return defaultState;
}

export function saveState(state: AppState) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }
}
