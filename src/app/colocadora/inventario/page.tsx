'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Store,
  Building2,
  Package,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  HelpCircle,
  Tag,
  Barcode,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

interface Tienda {
  id: string;
  nombre: string;
  ciudad: string | null;
}

interface Producto {
  id: string;
  nombre: string;
  codigoU: string;
  codigoBarras: string;
  imagenUrl: string | null;
  empresaId: string;
}

interface Empresa {
  id: string;
  nombre: string;
  productos: Producto[];
}

export default function ColocadoraInventarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  
  // Selection
  const [selectedTiendaId, setSelectedTiendaId] = useState('');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Quantities map: { [productoId]: string }
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
  
  // Modals & Feedback
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadContext() {
      try {
        setLoading(true);
        const res = await fetch('/api/colocadora/context');
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Error cargando contexto');

        setTiendas(data.tiendas);
        setEmpresas(data.empresas);

        if (data.tiendas.length > 0) {
          setSelectedTiendaId(data.tiendas[0].id);
        }
        if (data.empresas.length > 0) {
          setSelectedEmpresaId(data.empresas[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadContext();
  }, []);

  // Current active products for selected company
  const currentEmpresa = empresas.find((e) => e.id === selectedEmpresaId);
  const activeProducts = currentEmpresa ? currentEmpresa.productos : [];

  // Reset quantities when empresa changes
  useEffect(() => {
    const initial: { [key: string]: string } = {};
    activeProducts.forEach((p) => {
      initial[p.id] = '0';
    });
    setQuantities(initial);
  }, [selectedEmpresaId, empresas]);

  /**
   * Validación estricta en tiempo real según el requerimiento del PDF:
   * - No letras
   * - Solamente números enteros
   * - Evitar el ingreso de "00" o ceros repetidos
   * - Mayor o igual a 0
   */
  const handleQuantityChange = (productoId: string, rawVal: string) => {
    // 1. Quitar todo lo que no sea dígito
    let cleaned = rawVal.replace(/\D/g, '');

    // 2. Si el usuario escribe '00', '000', mantener solo '0'
    if (/^0+$/.test(cleaned)) {
      cleaned = '0';
    } else if (cleaned.length > 1 && cleaned.startsWith('0')) {
      // Si escribe 05 -> convertir a 5
      cleaned = cleaned.replace(/^0+/, '');
    }

    setQuantities((prev) => ({
      ...prev,
      [productoId]: cleaned,
    }));
  };

  const handleIncrement = (productoId: string) => {
    const current = parseInt(quantities[productoId] || '0', 10) || 0;
    setQuantities((prev) => ({
      ...prev,
      [productoId]: String(current + 1),
    }));
  };

  const handleDecrement = (productoId: string) => {
    const current = parseInt(quantities[productoId] || '0', 10) || 0;
    if (current > 0) {
      setQuantities((prev) => ({
        ...prev,
        [productoId]: String(current - 1),
      }));
    }
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTiendaId) {
      setError('Debes seleccionar la tienda atendida');
      return;
    }
    if (!selectedEmpresaId) {
      setError('Debes seleccionar la empresa colocada');
      return;
    }
    if (activeProducts.length === 0) {
      setError('No hay productos registrados para la empresa seleccionada');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const items = activeProducts.map((p) => ({
        productoId: p.id,
        cantidadFisica: parseInt(quantities[p.id] || '0', 10) || 0,
      }));

      const res = await fetch('/api/colocadora/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiendaId: selectedTiendaId,
          empresaId: selectedEmpresaId,
          observaciones,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar inventario');

      setShowConfirmModal(false);
      setSuccess('¡Inventario guardado y enviado con éxito!');

      // Redirigir al historial tras 1.5s
      setTimeout(() => {
        router.push('/colocadora/historial');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Resumen de conteo
  const totalUnidades = Object.values(quantities).reduce(
    (acc, val) => acc + (parseInt(val || '0', 10) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Botón Volver y Título */}
      <div className="flex items-center gap-3">
        <Link
          href="/colocadora"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            Ingreso de Inventario
          </h1>
          <p className="text-xs text-slate-500">
            Captura el conteo físico de existencias por producto en tienda.
          </p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs">Cargando supermercados y productos...</span>
        </div>
      ) : (
        <form onSubmit={handleOpenConfirm} className="space-y-5">
          {/* Tarjeta de Selectores de Ubicación y Empresa */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Datos de la Visita y Colocación
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  Tienda / Supermercado Atendido *
                </label>
                <select
                  required
                  value={selectedTiendaId}
                  onChange={(e) => setSelectedTiendaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {tiendas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} {t.ciudad ? `(${t.ciudad})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Empresa Colocada *
                </label>
                <select
                  required
                  value={selectedEmpresaId}
                  onChange={(e) => setSelectedEmpresaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} ({e.productos.length} productos)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Observaciones o Notas de la Visita (Opcional)
              </label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="ej. Todo ordenado en anaquel central, exhibición completa"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Listado de Productos y Captura de Cantidades */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Conteo de Productos por Anaquel
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Ingresa las unidades físicas encontradas en tienda.
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                {activeProducts.length} productos
              </span>
            </div>

            {activeProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay productos dados de alta para esta empresa.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeProducts.map((prod) => {
                  const qty = quantities[prod.id] || '0';
                  return (
                    <div
                      key={prod.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Información del Producto */}
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                          {prod.imagenUrl ? (
                            <img
                              src={prod.imagenUrl}
                              alt={prod.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-sm text-slate-900">
                            {prod.nombre}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-medium text-slate-700">
                              <Tag className="w-2.5 h-2.5" /> {prod.codigoU}
                            </span>
                            <span className="inline-flex items-center gap-0.5 font-mono text-slate-400">
                              <Barcode className="w-2.5 h-2.5" /> {prod.codigoBarras}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Control Numérico Táctil con Validación */}
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDecrement(prod.id)}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-lg flex items-center justify-center transition"
                        >
                          -
                        </button>

                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={qty}
                            onChange={(e) => handleQuantityChange(prod.id, e.target.value)}
                            className="w-20 h-10 text-center font-bold text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleIncrement(prod.id)}
                          className="w-10 h-10 rounded-xl bg-emerald-100 hover:bg-emerald-200 active:scale-95 text-emerald-800 font-bold text-lg flex items-center justify-center transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Barra Flotante / Inferior de Envío */}
          <div className="sticky bottom-4 z-20 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Unidades Contadas
              </div>
              <div className="text-xl font-bold text-emerald-400">
                {totalUnidades} <span className="text-xs text-white font-normal">piezas</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={activeProducts.length === 0}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Inventario</span>
            </button>
          </div>
        </form>
      )}

      {/* Modal de Confirmación de Envío */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              Confirmar Envío de Inventario
            </h2>

            <p className="text-xs text-slate-600 mt-2">
              Estás a punto de enviar el conteo físico con los siguientes datos:
            </p>

            <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Supermercado:</span>
                <span className="font-bold text-slate-900">
                  {tiendas.find((t) => t.id === selectedTiendaId)?.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Empresa:</span>
                <span className="font-bold text-slate-900">
                  {currentEmpresa?.nombre}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                <span className="text-slate-700">Total Unidades:</span>
                <span className="text-emerald-700">{totalUnidades} piezas</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Revisar Conteo
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar y Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
