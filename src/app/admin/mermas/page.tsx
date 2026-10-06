'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Store,
  Building2,
  Package,
  Calendar,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  FileText,
  Users,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminMermasPage() {
  const [mermas, setMermas] = useState<any[]>([]);
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTienda, setFilterTienda] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalTiendaId, setModalTiendaId] = useState('');
  const [modalEmpresaId, setModalEmpresaId] = useState('');
  const [modalProductoId, setModalProductoId] = useState('');
  const [modalImagenUrl, setModalImagenUrl] = useState('');
  const [modalDescripcion, setModalDescripcion] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchMermas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterTienda) params.append('tiendaId', filterTienda);
      if (filterEmpresa) params.append('empresaId', filterEmpresa);

      const res = await fetch(`/api/admin/mermas?${params.toString()}`);
      const data = await res.json();
      if (data.success) setMermas(data.mermas);
    } catch (err) {
      console.error('Error cargando mermas:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [resTiendas, resEmpresas] = await Promise.all([
        fetch('/api/admin/tiendas').then((r) => r.json()),
        fetch('/api/admin/empresas').then((r) => r.json()),
      ]);

      if (resTiendas.success) setTiendas(resTiendas.tiendas);
      if (resEmpresas.success) setEmpresas(resEmpresas.empresas);

      if (resTiendas.tiendas?.length > 0) setModalTiendaId(resTiendas.tiendas[0].id);
      if (resEmpresas.empresas?.length > 0) {
        setModalEmpresaId(resEmpresas.empresas[0].id);
        if (resEmpresas.empresas[0].productos?.length > 0) {
          setModalProductoId(resEmpresas.empresas[0].productos[0].id);
        }
      }
    } catch (err) {
      console.error('Error cargando catálogos:', err);
    }
  };

  useEffect(() => {
    fetchAuxData();
  }, []);

  useEffect(() => {
    fetchMermas();
  }, [filterTienda, filterEmpresa]);

  const selectedEmpresa = empresas.find((e) => e.id === modalEmpresaId);
  const modalProducts = selectedEmpresa?.productos || [];

  useEffect(() => {
    if (modalProducts.length > 0) {
      setModalProductoId(modalProducts[0].id);
    } else {
      setModalProductoId('');
    }
  }, [modalEmpresaId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setModalError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'mermas');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir imagen');
      setModalImagenUrl(data.url);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateMerma = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    if (!modalImagenUrl) {
      setModalError('Debes adjuntar una fotografía de evidencia');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/mermas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: modalEmpresaId,
          tiendaId: modalTiendaId,
          productoId: modalProductoId,
          imagenUrl: modalImagenUrl,
          descripcion: modalDescripcion,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar reporte');

      setShowModal(false);
      setSuccess('Reporte de merma registrado exitosamente.');
      setModalDescripcion('');
      setModalImagenUrl('');
      fetchMermas();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = mermas.filter((m) => {
    const term = search.toLowerCase();
    return (
      m.producto.nombre.toLowerCase().includes(term) ||
      m.producto.codigoU.toLowerCase().includes(term) ||
      m.tienda.nombre.toLowerCase().includes(term) ||
      m.empresa.nombre.toLowerCase().includes(term) ||
      m.descripcion.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Auditoría de Productos en Mal Estado y Mermas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Control visual y registro de evidencias de productos dañados reportados en supermercados.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Merma</span>
        </button>
      </div>

      {/* Alerta de éxito */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto, tienda o descripción..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <select
          value={filterTienda}
          onChange={(e) => setFilterTienda(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
        >
          <option value="">Todos los Supermercados</option>
          {tiendas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>

        <select
          value={filterEmpresa}
          onChange={(e) => setFilterEmpresa(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
        >
          <option value="">Todas las Empresas</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Galería / Grid de Mermas */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
          <span className="text-xs">Cargando reportes de productos dañados...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          No hay reportes de mermas registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Foto Evidencia */}
                <div
                  onClick={() => setLightboxImg(item.imagenUrl)}
                  className="relative h-44 bg-slate-100 cursor-pointer group overflow-hidden border-b border-slate-100"
                >
                  <img
                    src={item.imagenUrl}
                    alt={item.producto.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-3 py-1.5 bg-white/90 rounded-xl text-xs font-bold text-slate-900 shadow-lg flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-rose-600" /> Ampliar Evidencia
                    </span>
                  </div>
                </div>

                {/* Datos */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold">
                      {item.empresa.nombre}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDate(item.fecha)}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-snug">{item.producto.nombre}</h2>
                    <div className="text-[11px] text-slate-400 font-mono">{item.producto.codigoU}</div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                      Motivo / Descripción de lo Sucedido:
                    </div>
                    &quot;{item.descripcion}&quot;
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Store className="w-3 h-3 text-slate-400" /> {item.tienda.nombre}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" /> {item.colocadora?.nombre || 'Admin'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="relative max-w-2xl max-h-[85vh] w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImg} alt="Evidencia completa" className="w-full h-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* Modal Nueva Merma */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Registrar Producto en Mal Estado
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMerma} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supermercado *</label>
                <select
                  required
                  value={modalTiendaId}
                  onChange={(e) => setModalTiendaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  {tiendas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Empresa Proveedora *</label>
                <select
                  required
                  value={modalEmpresaId}
                  onChange={(e) => setModalEmpresaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Producto Dañado *</label>
                <select
                  required
                  value={modalProductoId}
                  onChange={(e) => setModalProductoId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  {modalProducts.length === 0 ? (
                    <option value="">No hay productos para esta empresa</option>
                  ) : (
                    modalProducts.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.codigoU})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fotografía de Evidencia *</label>
                <label className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-2xl bg-rose-50/40 transition">
                  <Camera className="w-5 h-5 text-rose-600 mb-1" />
                  <span className="text-xs font-bold text-slate-700">
                    {uploadingImage ? 'Subiendo fotografía...' : 'Cargar Fotografía'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                </label>
                {modalImagenUrl && (
                  <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Imagen cargada exitosamente
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción de lo Sucedido *</label>
                <textarea
                  required
                  rows={3}
                  value={modalDescripcion}
                  onChange={(e) => setModalDescripcion(e.target.value)}
                  placeholder="Detallar causa del daño..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage || !modalImagenUrl}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
