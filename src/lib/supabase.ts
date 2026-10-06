import { createClient, SupabaseClient } from '@supabase/supabase-js';

const LS_URL_KEY = 'LOS_ALTOS_CUSTOM_SUPABASE_URL';
const LS_KEY_KEY = 'LOS_ALTOS_CUSTOM_SUPABASE_KEY';

export function getStoredSupabaseConfig() {
  if (typeof window === 'undefined') {
    return {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    };
  }
  const storedUrl = localStorage.getItem(LS_URL_KEY) || import.meta.env.VITE_SUPABASE_URL || '';
  const storedKey = localStorage.getItem(LS_KEY_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url: storedUrl.trim(), key: storedKey.trim() };
}

let activeClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key || !url.startsWith('http')) {
    return null;
  }
  if (!activeClient) {
    try {
      activeClient = createClient(url, key);
    } catch (e) {
      console.warn('Error initializing Supabase client:', e);
      return null;
    }
  }
  return activeClient;
}

export function saveStoredSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url.trim()) localStorage.setItem(LS_URL_KEY, url.trim());
    else localStorage.removeItem(LS_URL_KEY);

    if (key.trim()) localStorage.setItem(LS_KEY_KEY, key.trim());
    else localStorage.removeItem(LS_KEY_KEY);

    activeClient = null;
    getSupabaseClient();
  }
}

export function clearStoredSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LS_URL_KEY);
    localStorage.removeItem(LS_KEY_KEY);
    activeClient = null;
  }
}

export async function testSupabaseConnection(
  url: string,
  key: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !key || !url.startsWith('http')) {
      return { success: false, message: 'La URL y la API Key son obligatorias.' };
    }
    const testClient = createClient(url.trim(), key.trim());
    const { error } = await testClient.from('tiendas').select('id').limit(1);
    if (error) {
      return {
        success: false,
        message: `Error de Supabase: ${error.message} (Verifica tus tablas o políticas RLS)`,
      };
    }
    return { success: true, message: '¡Conexión exitosa con tu base de datos Supabase!' };
  } catch (err: any) {
    return {
      success: false,
      message: `Error al conectar: ${err?.message || 'Verifica la URL y la API Key'}`,
    };
  }
}

export const isSupabaseConfigured = () => {
  const { url, key } = getStoredSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
};

// Types matching the Supabase Schema
export interface SupabaseTienda {
  id: string;
  nombre: string;
  creado_en?: string;
}

export interface SupabaseEmpresa {
  id: string;
  nombre: string;
  creado_en?: string;
}

export interface SupabaseProducto {
  id: string;
  empresa_id: string;
  nombre: string;
  codigo_u: string;
  codigo_barras: string;
  url_imagen: string;
  creado_en?: string;
}

export interface SupabaseColocadora {
  id: string;
  nombre: string;
  dpi: string;
  tiendas_asignadas: string;
  fecha_contratacion: string;
  estado: string;
  motivo_baja?: string | null;
  creado_en?: string;
}

export interface SupabaseInventario {
  id: string;
  colocadora_id: string;
  tienda_id: string;
  producto_id: string;
  cantidad: number;
  fecha_registro: string;
}

export interface SupabaseMerma {
  id: string;
  empresa_id: string;
  descripcion: string;
  url_fotografia: string;
  fecha_reporte: string;
}

// SQL Script generator for easy copy-paste
export const SUPABASE_SQL_SCHEMA = `-- Script SQL para crear las tablas en Supabase
-- Abre el SQL Editor en tu dashboard de Supabase y ejecuta este código:

-- 1. Tabla de Tiendas
CREATE TABLE IF NOT EXISTS public.tiendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Empresas
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  codigo_u TEXT,
  codigo_barras TEXT,
  url_imagen TEXT,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Colocadoras
CREATE TABLE IF NOT EXISTS public.colocadoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  dpi TEXT NOT NULL,
  tiendas_asignadas TEXT,
  fecha_contratacion DATE DEFAULT CURRENT_DATE,
  estado TEXT DEFAULT 'ACTIVA',
  motivo_baja TEXT,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Inventarios
CREATE TABLE IF NOT EXISTS public.inventarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colocadora_id UUID REFERENCES public.colocadoras(id) ON DELETE CASCADE,
  tienda_id UUID REFERENCES public.tiendas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
  cantidad INT4 NOT NULL DEFAULT 0,
  fecha_registro TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Mermas
CREATE TABLE IF NOT EXISTS public.mermas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  url_fotografia TEXT,
  fecha_reporte TIMESTAMPTZ DEFAULT now()
);

-- Habilitar permisos de lectura/escritura anónimos para la Demo (opcional)
ALTER TABLE public.tiendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colocadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mermas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública tiendas" ON public.tiendas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Lectura pública empresas" ON public.empresas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Lectura pública productos" ON public.productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Lectura pública colocadoras" ON public.colocadoras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Lectura pública inventarios" ON public.inventarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Lectura pública mermas" ON public.mermas FOR ALL USING (true) WITH CHECK (true);
`;

// Service methods with safe fallbacks
export const supabaseService = {
  async getTiendas(): Promise<SupabaseTienda[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data, error } = await client
      .from('tiendas')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) {
      console.warn('Supabase query tiendas:', error.message);
      return [];
    }
    return data || [];
  },

  async addTienda(nombre: string): Promise<SupabaseTienda | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('tiendas')
      .insert({ nombre })
      .select()
      .single();
    if (error) {
      console.warn('Supabase addTienda:', error.message);
      return null;
    }
    return data;
  },

  async getEmpresas(): Promise<SupabaseEmpresa[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data, error } = await client
      .from('empresas')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) {
      console.warn('Supabase query empresas:', error.message);
      return [];
    }
    return data || [];
  },

  async addEmpresa(nombre: string): Promise<SupabaseEmpresa | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('empresas')
      .insert({ nombre })
      .select()
      .single();
    if (error) {
      console.warn('Supabase addEmpresa:', error.message);
      return null;
    }
    return data;
  },

  async getProductos(): Promise<SupabaseProducto[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data, error } = await client
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) {
      console.warn('Supabase query productos:', error.message);
      return [];
    }
    return data || [];
  },

  async addProducto(
    producto: Omit<SupabaseProducto, 'id' | 'creado_en'>
  ): Promise<SupabaseProducto | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('productos')
      .insert(producto)
      .select()
      .single();
    if (error) {
      console.warn('Supabase addProducto:', error.message);
      return null;
    }
    return data;
  },

  async getColocadoras(): Promise<SupabaseColocadora[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data, error } = await client
      .from('colocadoras')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) {
      console.warn('Supabase query colocadoras:', error.message);
      return [];
    }
    return data || [];
  },

  async addColocadora(
    colocadora: Omit<SupabaseColocadora, 'id' | 'creado_en'>
  ): Promise<SupabaseColocadora | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('colocadoras')
      .insert(colocadora)
      .select()
      .single();
    if (error) {
      console.warn('Supabase addColocadora:', error.message);
      return null;
    }
    return data;
  },

  async updateColocadoraBaja(id: string, motivo_baja: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    const { error } = await client
      .from('colocadoras')
      .update({ estado: 'INACTIVA', motivo_baja })
      .eq('id', id);
    if (error) console.warn('Supabase updateColocadoraBaja:', error.message);
  },

  async getInventarios(): Promise<SupabaseInventario[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data, error } = await client
      .from('inventarios')
      .select('*')
      .order('fecha_registro', { ascending: false });
    if (error) {
      console.warn('Supabase query inventarios:', error.message);
      return [];
    }
    return data || [];
  },

  async addInventario(
    colocadora_id: string,
    tienda_id: string,
    producto_id: string,
    cantidad: number
  ): Promise<SupabaseInventario | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('inventarios')
      .insert({
        colocadora_id,
        tienda_id,
        producto_id,
        cantidad,
        fecha_registro: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      console.warn('Supabase addInventario:', error.message);
      return null;
    }
    return data;
  },

  async getMermas(): Promise<SupabaseMerma[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data, error } = await client
      .from('mermas')
      .select('*')
      .order('fecha_reporte', { ascending: false });
    if (error) {
      console.warn('Supabase query mermas:', error.message);
      return [];
    }
    return data || [];
  },

  async addMerma(
    empresa_id: string,
    descripcion: string,
    url_fotografia: string
  ): Promise<SupabaseMerma | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('mermas')
      .insert({
        empresa_id,
        descripcion,
        url_fotografia,
        fecha_reporte: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      console.warn('Supabase addMerma:', error.message);
      return null;
    }
    return data;
  },
};
