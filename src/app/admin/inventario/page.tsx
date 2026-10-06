'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Store,
  Building2,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Package,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminInventariosPage() {
  const [inventarios, setInventarios] = useState<any[]>([]);
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [colocadoras, setColocadoras] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [filterTienda, setFilterTienda] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');

  // Modal New Inventory
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalColocadoraId, setModalColocadoraId] = useState('');
  const [modalTiendaId, setModalTiendaId] = useState('');
  const [modalEmpresaId, setModalEmpresaId] = useState('');
  const [modalObservaciones, setModalObservaciones] = useState('');
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchInventarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterTienda) params.append('tiendaId', filterTienda);
      if (filterEmpresa) params.append('empresaId', filterEmpresa);

      const res = await fetch(`/api/admin/inventario?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setInventarios(data.inventarios);
        if (data.inventarios.length > 0 && !expandedId) {
          setExpandedId(data.inventarios[0].id);
        }
      }
    } catch (err) {
      console.error('Error cargando inventarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [resTiendas, resEmpresas, resColocadoras] = await Promise.all([
        fetch('/api/admin/tiendas').then((r) => r.json()),
        fetch('/api/admin/empresas').then((r) => r.json()),
        fetch('/api/admin/colocadoras').then((r) => r.json()),
      ]);

      if (resTiendas.success) setTiendas(resTiendas.tiendas);
      if (resEmpresas.success) setEmpresas(resEmpresas.empresas);
      if (resColocadoras.success) setColocadoras(resColocadoras.colocadoras);

      if (resColocadoras.colocadoras?.length > 0) setModalColocadoraId(resColocadoras.colocadoras[0].id);
      if (resTiendas.tiendas?.length > 0) setModalTiendaId(resTiendas.tiendas[0].id);
      if (resEmpresas.empresas?.length > 0) setModalEmpresaId(resEmpresas.empresas[0].id);
    } catch (err) {
      console.error('Error cargando catálogos:', err);
    }
  };

  useEffect(() => {
    fetchAuxData();
  }, []);

  useEffect(() => {
    fetchInventarios();
  }, [filterTienda, filterEmpresa]);

  // Selected company products in modal
  const selectedEmpresa = empresas.find((e) => e.id === modalEmpresaId);
  const activeProducts = selectedEmpresa?.productos || [];

  useEffect(() => {
    const initial: { [key: string]: string } = {};
    activeProducts.forEach((p: any) => {
      initial[p.id] = '0';
    });
    setQuantities(initial);
  }, [modalEmpresaId, empresas]);

  const handleQuantityChange = (productoId: string, rawVal: string) => {
    let cleaned = rawVal.replace(/\D/g, '');
    if (/^0+$/.test(cleaned)) cleaned = '0';
    else if (cleaned.length > 1 && cleaned.startsWith('0')) cleaned = cleaned.replace(/^0+/, '');
    setQuantities((prev) => ({ ...prev, [productoId]: cleaned }));
  };

  const handleCreateInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    try {
      const items = activeProducts.map((p: any) => ({
        productoId: p.id,
        cantidadFisica: parseInt(quantities[p.id] || '0', 10) || 0,
      }));

      const res = await fetch('/api/admin/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colocadoraId: modalColocadoraId,
          tiendaId: modalTiendaId,
          empresaId: modalEmpresaId,
          observaciones: modalObservaciones,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar inventario');

      setShowModal(false);
      setSuccess('Inventario registrado exitosamente.');
      fetchInventarios();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Inventarios Globales en Tiendas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Supervisión y registro de existencias físicas capturadas en supermercados independientes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Inventario</span>
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Store className="w-3 h-3 text-slate-500" /> Filtrar por Supermercado
          </label>
          <select
            value={filterTienda}
            onChange={(e) => setFilterTienda(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Todos los Supermercados</option>
            {tiendas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} {t.ciudad ? `(${t.ciudad})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-500" /> Filtrar por Empresa
          </label>
          <select
            value={filterEmpresa}
            onChange={(e) => setFilterEmpresa(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

      {/* Listado de Inventarios */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Cargando inventarios...</span>
        </div>
      ) : inventarios.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          No se encontraron registros de inventario con los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-4">
          {inventarios.map((reg) => {
            const isExpanded = expandedId === reg.id;
            const totalPiezas = reg.detalles.reduce(
              (acc: number, d: any) => acc + d.cantidadFisica,
              0
            );

            return (
              <div
                key={reg.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-amber-600" />
                        {reg.tienda.nombre}
                      </span>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {reg.empresa.nombre}
                      </span>
                      <span className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {reg.colocadora?.nombre || 'Administrador'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(reg.fecha)}</span>
                      {reg.observaciones && (
                        <span className="italic text-slate-500 ml-2">
                          — &quot;{reg.observaciones}&quot;
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Total Existencias</div>
                      <div className="text-sm sm:text-base font-bold text-emerald-700">
                        {totalPiezas} piezas
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Productos Registrados ({reg.detalles.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {reg.detalles.map((det: any) => (
                        <div
                          key={det.id}
                          className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200">
                              {det.producto.imagenUrl ? (
                                <img src={det.producto.imagenUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-800 truncate">{det.producto.nombre}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{det.producto.codigoU}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold shrink-0">
                            {det.cantidadFisica} uds
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Registrar Inventario */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Registrar Conteo de Inventario
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

            <form onSubmit={handleCreateInventario} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Colocadora Asignada *</label>
                  <select
                    required
                    value={modalColocadoraId}
                    onChange={(e) => setModalColocadoraId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {colocadoras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} (DPI: {c.dpi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supermercado Atendido *</label>
                  <select
                    required
                    value={modalTiendaId}
                    onChange={(e) => setModalTiendaId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {tiendas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Empresa Proveedora *</label>
                <select
                  required
                  value={modalEmpresaId}
                  onChange={(e) => setModalEmpresaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} ({e.productos?.length || 0} productos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notas / Observaciones</label>
                <input
                  type="text"
                  value={modalObservaciones}
                  onChange={(e) => setModalObservaciones(e.target.value)}
                  placeholder="ej. Ajuste físico por auditoría"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Listado de Productos */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 mb-2">Conteo por Producto:</div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl p-2 bg-slate-50">
                  {activeProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No hay productos en esta empresa.</div>
                  ) : (
                    activeProducts.map((p: any) => (
                      <div key={p.id} className="py-2 px-2 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-800 truncate">{p.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.codigoU}</div>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={quantities[p.id] || '0'}
                          onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                          className="w-16 h-8 text-center font-bold text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    ))
                  )}
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
                  disabled={submitting || activeProducts.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Inventario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
