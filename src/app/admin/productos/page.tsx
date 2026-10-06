'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Building2,
  Barcode,
  Tag,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
} from 'lucide-react';
import Image from 'next/image';

interface Producto {
  id: string;
  nombre: string;
  codigoU: string;
  codigoBarras: string;
  imagenUrl: string | null;
  activo: boolean;
  empresaId: string;
  empresa: {
    id: string;
    nombre: string;
  };
  createdAt: string;
}

interface EmpresaSimple {
  id: string;
  nombre: string;
}

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [codigoU, setCodigoU] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [empresaId, setEmpresaId] = useState('');

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/productos?search=${encodeURIComponent(search)}&empresaId=${encodeURIComponent(
        selectedEmpresa
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProductos(data.productos);
      }
    } catch (err) {
      console.error('Error fetching productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const res = await fetch('/api/admin/empresas');
      const data = await res.json();
      if (data.success) {
        setEmpresas(data.empresas.map((e: any) => ({ id: e.id, nombre: e.nombre })));
      }
    } catch (err) {
      console.error('Error fetching empresas:', err);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [search, selectedEmpresa]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'productos');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      setImagenUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          codigoU,
          codigoBarras,
          imagenUrl: imagenUrl || undefined,
          empresaId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar el producto');
      }

      setSuccess('Producto registrado en el catálogo exitosamente');
      setShowModal(false);
      // Reset form
      setNombre('');
      setCodigoU('');
      setCodigoBarras('');
      setImagenUrl('');
      setEmpresaId('');
      fetchProductos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-600" />
            Catálogo de Productos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestión de códigos internos (Código U), códigos de barras y fotografías por empresa.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            if (empresas.length > 0 && !empresaId) {
              setEmpresaId(empresas[0].id);
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Ingresar Producto
        </button>
      </div>

      {/* Alertas */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Filtros y Buscador */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de producto, Código U o Código de barras..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <select
            value={selectedEmpresa}
            onChange={(e) => setSelectedEmpresa(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="">Todas las Empresas</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs">Cargando catálogo...</span>
        </div>
      ) : productos.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
          No se encontraron productos registrados en este criterio.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productos.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Imagen del Producto */}
              <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                {prod.imagenUrl ? (
                  <img
                    src={prod.imagenUrl}
                    alt={prod.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon className="w-8 h-8 stroke-1" />
                    <span className="text-[11px] mt-1">Sin fotografía</span>
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur text-slate-700 shadow-xs border border-slate-200">
                    {prod.empresa.nombre}
                  </span>
                </div>
              </div>

              {/* Información */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                    {prod.nombre}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Código U:
                      </span>
                      <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        {prod.codigoU}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Barcode className="w-3 h-3" /> Código Barras:
                      </span>
                      <span className="font-mono text-slate-700 text-[11px]">
                        {prod.codigoBarras}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" /> Disponible
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ingresar Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Ingresar Nuevo Producto
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Empresa Proveedora *
                </label>
                <select
                  required
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="">Seleccione una empresa...</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Detergente Orix Floral 1kg"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código U (Interno de Supermercado) *
                  </label>
                  <input
                    type="text"
                    required
                    value={codigoU}
                    onChange={(e) => setCodigoU(e.target.value)}
                    placeholder="ej. ORX-101"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Barras *
                  </label>
                  <input
                    type="text"
                    required
                    value={codigoBarras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    placeholder="ej. 740100234001"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Subida de Imagen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fotografía del Producto
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl bg-slate-50 hover:bg-indigo-50/30 transition text-xs text-slate-600">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>{uploadingImage ? 'Subiendo imagen...' : 'Seleccionar fotografía...'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {imagenUrl && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <img
                      src={imagenUrl}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                    <div className="flex-1 truncate text-xs text-slate-600 font-mono">
                      {imagenUrl}
                    </div>
                    <button
                      type="button"
                      onClick={() => setImagenUrl('')}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
