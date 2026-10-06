import { createClient } from '@supabase/supabase-js';

// Supabase credentials provided by user
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://mcpscfblpvffqjloukiz.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_o3qwqY82HaW2nzz56bk6NA_rpYx1k0z';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Service methods for Supabase queries
export const supabaseService = {
  async getTiendas(): Promise<SupabaseTienda[]> {
    const { data, error } = await supabase
      .from('tiendas')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) {
      console.error('Error fetching tiendas from Supabase:', error);
      throw error;
    }
    return data || [];
  },

  async addTienda(nombre: string): Promise<SupabaseTienda> {
    const { data, error } = await supabase
      .from('tiendas')
      .insert({ nombre })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getEmpresas(): Promise<SupabaseEmpresa[]> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) {
      console.error('Error fetching empresas from Supabase:', error);
      throw error;
    }
    return data || [];
  },

  async addEmpresa(nombre: string): Promise<SupabaseEmpresa> {
    const { data, error } = await supabase
      .from('empresas')
      .insert({ nombre })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getProductos(): Promise<SupabaseProducto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) {
      console.error('Error fetching productos from Supabase:', error);
      throw error;
    }
    return data || [];
  },

  async addProducto(producto: Omit<SupabaseProducto, 'id' | 'creado_en'>): Promise<SupabaseProducto> {
    const { data, error } = await supabase
      .from('productos')
      .insert(producto)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getColocadoras(): Promise<SupabaseColocadora[]> {
    const { data, error } = await supabase
      .from('colocadoras')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) {
      console.error('Error fetching colocadoras from Supabase:', error);
      throw error;
    }
    return data || [];
  },

  async addColocadora(colocadora: Omit<SupabaseColocadora, 'id' | 'creado_en'>): Promise<SupabaseColocadora> {
    const { data, error } = await supabase
      .from('colocadoras')
      .insert(colocadora)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateColocadoraBaja(id: string, motivo_baja: string): Promise<void> {
    const { error } = await supabase
      .from('colocadoras')
      .update({ estado: 'INACTIVA', motivo_baja })
      .eq('id', id);
    if (error) throw error;
  },

  async getInventarios(): Promise<SupabaseInventario[]> {
    const { data, error } = await supabase
      .from('inventarios')
      .select('*')
      .order('fecha_registro', { ascending: false });
    if (error) {
      console.error('Error fetching inventarios from Supabase:', error);
      throw error;
    }
    return data || [];
  },

  async addInventario(
    colocadora_id: string,
    tienda_id: string,
    producto_id: string,
    cantidad: number
  ): Promise<SupabaseInventario> {
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
    if (error) throw error;
    return data;
  },

  async getMermas(): Promise<SupabaseMerma[]> {
    const { data, error } = await supabase
      .from('mermas')
      .select('*')
      .order('fecha_reporte', { ascending: false });
    if (error) {
      console.error('Error fetching mermas from Supabase:', error);
      throw error;
    }
    return data || [];
  },

  async addMerma(
    empresa_id: string,
    descripcion: string,
    url_fotografia: string
  ): Promise<SupabaseMerma> {
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
    if (error) throw error;
    return data;
  },
};
