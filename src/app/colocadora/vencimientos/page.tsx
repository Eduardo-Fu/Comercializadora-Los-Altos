'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  ArrowLeft,
  Building2,
  Store,
  Package,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
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
  empresaId: string;
}

interface Empresa {
  id: string;
  nombre: string;
  productos: Producto[];
}

export default function ColocadoraVencimientosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  // Form State
  const [selectedTiendaId, setSelectedTiendaId] = useState('');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('');
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [cantidad, setCantidad] = useState('1');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadContext() {
      try {
        setLoading(true);
        const res = await fetch('/api/colocadora/context');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error cargando datos');

        setTiendas(data.tiendas);
        setEmpresas(data.empresas);

        if (data.tiendas.length > 0) setSelectedTiendaId(data.tiendas[0].id);
        if (data.empresas.length > 0) {
          setSelectedEmpresaId(data.empresas[0].id);
          if (data.empresas[0].productos.length > 0) {
            setSelectedProductoId(data.empresas[0].productos[0].id);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadContext();
  }, []);

  const currentEmpresa = empresas.find((e) => e.id === selectedEmpresaId);
  const currentProducts = currentEmpresa ? currentEmpresa.productos : [];

  useEffect(() => {
    if (currentProducts.length > 0) {
      setSelectedProductoId(currentProducts[0].id);
    } else {
      setSelectedProductoId('');
    }
  }, [selectedEmpresaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const parsedQty = parseInt(cantidad, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError('La cantidad debe ser un número entero mayor a 0.');
      setSubmitting(false);
      return;
    }

    if (!fechaVencimiento) {
      setError('Debes seleccionar la fecha de vencimiento del lote.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/colocadora/vencimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: selectedEmpresaId,
          tiendaId: selectedTiendaId,
          productoId: selectedProductoId,
          fechaVencimiento,
          cantidad: parsedQty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar vencimiento');

      setSuccess('Fecha de vencimiento registrada exitosamente.');
      setFechaVencimiento('');
      setCantidad('1');

      setTimeout(() => {
        router.push('/colocadora');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/colocadora"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-amber-600" />
            Ingreso de Fechas de Vencimiento
          </h1>
          <p className="text-xs text-slate-500">
            Registra fechas de caducidad para brindar visibilidad de rotación a las empresas.
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
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span className="text-xs">Cargando formulario de vencimientos...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                Supermercado / Tienda *
              </label>
              <select
                required
                value={selectedTiendaId}
                onChange={(e) => setSelectedTiendaId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                {tiendas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Empresa Proveedora *
              </label>
              <select
                required
                value={selectedEmpresaId}
                onChange={(e) => setSelectedEmpresaId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              Producto *
            </label>
            <select
              required
              value={selectedProductoId}
              onChange={(e) => setSelectedProductoId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              {currentProducts.length === 0 ? (
                <option value="">No hay productos para esta empresa</option>
              ) : (
                currentProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.codigoU})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                required
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Cantidad de Unidades con esta Fecha *
              </label>
              <input
                type="number"
                min="1"
                required
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !selectedProductoId || !fechaVencimiento}
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Registrar Fecha de Vencimiento
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
