import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials safely from environment variables only
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

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

// Service methods with safe fallbacks if Supabase is not configured
export const supabaseService = {
  async getTiendas(): Promise<SupabaseTienda[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
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
    if (!supabase) return null;
    const { data, error } = await supabase
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
    if (!supabase) return [];
    const { data, error } = await supabase
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
    if (!supabase) return null;
    const { data, error } = await supabase
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
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) {
      console.warn('Supabase query productos:', error.message);
      return [];
    }
    return data || [];
  },

  async addProducto(producto: Omit<SupabaseProducto, 'id' | 'creado_en'>): Promise<SupabaseProducto | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
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
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('colocadoras')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) {
      console.warn('Supabase query colocadoras:', error.message);
      return [];
    }
    return data || [];
  },

  async addColocadora(colocadora: Omit<SupabaseColocadora, 'id' | 'creado_en'>): Promise<SupabaseColocadora | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
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
    if (!supabase) return;
    const { error } = await supabase
      .from('colocadoras')
      .update({ estado: 'INACTIVA', motivo_baja })
      .eq('id', id);
    if (error) console.warn('Supabase updateColocadoraBaja:', error.message);
  },

  async getInventarios(): Promise<SupabaseInventario[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
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
    if (!supabase) return null;
    const { data, error } = await supabase
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
    if (!supabase) return [];
    const { data, error } = await supabase
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
    if (!supabase) return null;
    const { data, error } = await supabase
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
