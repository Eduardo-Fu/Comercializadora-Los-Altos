'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Store,
  Building2,
  Package,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminSugeridosPage() {
  const [sugeridos, setSugeridos] = useState<any[]>([]);
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTienda, setFilterTienda] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalTiendaId, setModalTiendaId] = useState('');
  const [modalEmpresaId, setModalEmpresaId] = useState('');
  const [modalProductoId, setModalProductoId] = useState('');
  const [modalCantidad, setModalCantidad] = useState('10');
  const [modalNotas, setModalNotas] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSugeridos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterTienda) params.append('tiendaId', filterTienda);
      if (filterEmpresa) params.append('empresaId', filterEmpresa);

      const res = await fetch(`/api/admin/sugeridos?${params.toString()}`);
      const data = await res.json();
      if (data.success) setSugeridos(data.sugeridos);
    } catch (err) {
      console.error('Error cargando pedidos sugeridos:', err);
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
    fetchSugeridos();
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

  const handleCreateSugerido = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    const parsedQty = parseInt(modalCantidad, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setModalError('La cantidad sugerida debe ser mayor a 0');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/sugeridos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: modalEmpresaId,
          tiendaId: modalTiendaId,
          productoId: modalProductoId,
          cantidadSugerida: parsedQty,
          notas: modalNotas,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar sugerido');

      setShowModal(false);
      setSuccess('Pedido sugerido registrado exitosamente.');
      setModalNotas('');
      fetchSugeridos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = sugeridos.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.producto.nombre.toLowerCase().includes(term) ||
      s.producto.codigoU.toLowerCase().includes(term) ||
      s.tienda.nombre.toLowerCase().includes(term) ||
      s.empresa.nombre.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Pedidos Sugeridos de Reabastecimiento
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Cálculo y registro de sugeridos para compras y reposición en supermercados.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Sugerido</span>
        </button>
      </div>

      {/* Alerta de éxito */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto, tienda o código..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={filterTienda}
          onChange={(e) => setFilterTienda(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">Todas las Empresas</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de Sugeridos */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs">Cargando sugeridos de pedido...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          No hay pedidos sugeridos registrados.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Producto</th>
                  <th className="px-5 py-3.5">Supermercado</th>
                  <th className="px-5 py-3.5">Empresa</th>
                  <th className="px-5 py-3.5 text-center">Cantidad Sugerida</th>
                  <th className="px-5 py-3.5">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sug) => (
                  <tr key={sug.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{sug.producto.nombre}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {sug.producto.codigoU} • {sug.producto.codigoBarras}
                      </div>
                      {sug.notas && (
                        <div className="text-[11px] text-indigo-600 mt-0.5 italic">
                          Nota: {sug.notas}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {sug.tienda.nombre}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">
                        {sug.empresa.nombre}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold">
                        +{sug.cantidadSugerida} uds
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {formatDate(sug.fecha)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nuevo Sugerido */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Crear Pedido Sugerido
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

            <form onSubmit={handleCreateSugerido} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supermercado / Tienda *</label>
                <select
                  required
                  value={modalTiendaId}
                  onChange={(e) => setModalTiendaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Producto a Reabastecer *</label>
                <select
                  required
                  value={modalProductoId}
                  onChange={(e) => setModalProductoId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Cantidad Sugerida (Unidades) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={modalCantidad}
                  onChange={(e) => setModalCantidad(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notas / Justificación</label>
                <input
                  type="text"
                  value={modalNotas}
                  onChange={(e) => setModalNotas(e.target.value)}
                  placeholder="ej. Stock bajo previo a fin de semana"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  disabled={submitting || !modalProductoId}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Sugerido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
