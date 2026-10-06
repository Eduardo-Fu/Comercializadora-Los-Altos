'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Search,
  Store,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function EmpresaVencimientosPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchVencimientos() {
      try {
        setLoading(true);
        const res = await fetch('/api/empresa/reportes/vencimientos');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error('Error cargando vencimientos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVencimientos();
  }, []);

  const vencimientos: any[] = data?.vencimientos || [];
  const resumen = data?.resumen || { vencidos: 0, porVencer: 0, vigentes: 0 };

  const filtered = vencimientos.filter((v) => {
    const term = search.toLowerCase();
    const matchSearch =
      v.producto.nombre.toLowerCase().includes(term) ||
      v.producto.codigoU.toLowerCase().includes(term) ||
      v.tienda.nombre.toLowerCase().includes(term);
    const matchEstado = filterEstado === 'TODOS' ? true : v.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/empresa"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-amber-600" />
            Reporte 5: Semáforo de Fechas de Vencimiento
          </h1>
          <p className="text-xs text-slate-500">
            Control y prevención de caducidades para optimizar promociones y rotación en góndola.
          </p>
        </div>
      </div>

      {/* Tarjetas de Semáforo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setFilterEstado(filterEstado === 'VENCIDO' ? 'TODOS' : 'VENCIDO')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            filterEstado === 'VENCIDO'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-200" />
            <span className="text-2xl font-black">{resumen.vencidos}</span>
          </div>
          <div className="mt-3 font-bold text-sm">Lotes Vencidos</div>
          <div className={`text-xs mt-0.5 ${filterEstado === 'VENCIDO' ? 'text-rose-100' : 'text-slate-400'}`}>
            Requieren retiro inmediato de góndola
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterEstado(filterEstado === 'POR_VENCER' ? 'TODOS' : 'POR_VENCER')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            filterEstado === 'POR_VENCER'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-200" />
            <span className="text-2xl font-black">{resumen.porVencer}</span>
          </div>
          <div className="mt-3 font-bold text-sm">Próximos a Vencer</div>
          <div className={`text-xs mt-0.5 ${filterEstado === 'POR_VENCER' ? 'text-amber-100' : 'text-slate-400'}`}>
            Vencimiento en 30 días o menos
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterEstado(filterEstado === 'VIGENTE' ? 'TODOS' : 'VIGENTE')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            filterEstado === 'VIGENTE'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-200" />
            <span className="text-2xl font-black">{resumen.vigentes}</span>
          </div>
          <div className="mt-3 font-bold text-sm">Lotes Vigentes</div>
          <div className={`text-xs mt-0.5 ${filterEstado === 'VIGENTE' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Caducidad mayor a 30 días
          </div>
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto, supermercado o código..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabla de Vencimientos */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span className="text-xs">Cargando semáforo de vencimientos...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          No hay lotes con los filtros seleccionados.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Producto</th>
                  <th className="px-5 py-3.5">Supermercado</th>
                  <th className="px-5 py-3.5 text-center">Unidades</th>
                  <th className="px-5 py-3.5">Fecha de Vencimiento</th>
                  <th className="px-5 py-3.5 text-right">Semáforo / Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{item.producto.nombre}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.producto.codigoU} • {item.producto.codigoBarras}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {item.tienda.nombre}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold font-mono">
                        {item.cantidad} uds
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {formatDate(item.fechaVencimiento)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.estado === 'VENCIDO' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-full">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Vencido ({Math.abs(item.diasRestantes)} días)
                        </span>
                      )}
                      {item.estado === 'POR_VENCER' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Por vencer ({item.diasRestantes} días)
                        </span>
                      )}
                      {item.estado === 'VIGENTE' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Vigente ({item.diasRestantes} días)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
