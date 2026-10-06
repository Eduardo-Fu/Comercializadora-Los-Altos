'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
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
  Clock,
  Layers,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminVencimientosPage() {
  const [vencimientos, setVencimientos] = useState<any[]>([]);
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
  const [modalFecha, setModalFecha] = useState('');
  const [modalCantidad, setModalCantidad] = useState('1');
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchVencimientos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterTienda) params.append('tiendaId', filterTienda);
      if (filterEmpresa) params.append('empresaId', filterEmpresa);

      const res = await fetch(`/api/admin/vencimientos?${params.toString()}`);
      const data = await res.json();
      if (data.success) setVencimientos(data.vencimientos);
    } catch (err) {
      console.error('Error cargando vencimientos:', err);
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
    fetchVencimientos();
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

  const getExpirationStatus = (fechaStr: string) => {
    const target = new Date(fechaStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Vencido hace ${Math.abs(diffDays)} días`,
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        dotClass: 'bg-red-500',
      };
    } else if (diffDays <= 30) {
      return {
        label: `Por vencer (${diffDays} días)`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    } else {
      return {
        label: `Vigente (${diffDays} días)`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    }
  };

  const handleCreateVencimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    const parsedQty = parseInt(modalCantidad, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setModalError('La cantidad debe ser mayor a 0');
      setSubmitting(false);
      return;
    }

    if (!modalFecha) {
      setModalError('Debes seleccionar la fecha de vencimiento');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/vencimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: modalEmpresaId,
          tiendaId: modalTiendaId,
          productoId: modalProductoId,
          fechaVencimiento: modalFecha,
          cantidad: parsedQty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar vencimiento');

      setShowModal(false);
      setSuccess('Fecha de vencimiento registrada exitosamente.');
      setModalFecha('');
      setModalCantidad('1');
      fetchVencimientos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = vencimientos.filter((v) => {
    const term = search.toLowerCase();
    return (
      v.producto.nombre.toLowerCase().includes(term) ||
      v.producto.codigoU.toLowerCase().includes(term) ||
      v.tienda.nombre.toLowerCase().includes(term) ||
      v.empresa.nombre.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-amber-600" />
            Control de Fechas de Vencimiento
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Semáforo preventivo de caducidades para análisis y optimización de rotación de productos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Vencimiento</span>
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
            placeholder="Buscar por producto, tienda o código..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={filterTienda}
          onChange={(e) => setFilterTienda(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          <option value="">Todas las Empresas</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de Vencimientos */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span className="text-xs">Cargando registros de vencimiento...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          No hay registros de vencimiento encontrados.
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
                  <th className="px-5 py-3.5 text-center">Unidades</th>
                  <th className="px-5 py-3.5">Fecha Vencimiento</th>
                  <th className="px-5 py-3.5 text-right">Estado / Semáforo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => {
                  const status = getExpirationStatus(v.fechaVencimiento);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{v.producto.nombre}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {v.producto.codigoU} • {v.producto.codigoBarras}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {v.tienda.nombre}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">
                          {v.empresa.nombre}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold font-mono">
                          {v.cantidad} uds
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {formatDate(v.fechaVencimiento)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.badgeClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${status.dotClass}`} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nuevo Vencimiento */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-amber-600" />
                Registrar Lote de Vencimiento
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

            <form onSubmit={handleCreateVencimiento} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supermercado *</label>
                <select
                  required
                  value={modalTiendaId}
                  onChange={(e) => setModalTiendaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Producto *</label>
                <select
                  required
                  value={modalProductoId}
                  onChange={(e) => setModalProductoId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={modalFecha}
                    onChange={(e) => setModalFecha(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidades *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={modalCantidad}
                    onChange={(e) => setModalCantidad(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
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
                  disabled={submitting || !modalProductoId || !modalFecha}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Vencimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
