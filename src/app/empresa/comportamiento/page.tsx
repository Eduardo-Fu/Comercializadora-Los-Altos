'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  ArrowLeft,
  Loader2,
  Package,
  Flame,
  Snowflake,
  Activity,
  BarChart2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function EmpresaComportamientoPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterRotacion, setFilterRotacion] = useState<string>('TODOS');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const res = await fetch('/api/empresa/reportes/comportamiento');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error('Error cargando comportamiento:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const productos: any[] = data?.productos || [];

  const filtered = productos.filter((p) => {
    const term = search.toLowerCase();
    const matchSearch =
      p.nombre.toLowerCase().includes(term) ||
      p.codigoU.toLowerCase().includes(term) ||
      p.codigoBarras.toLowerCase().includes(term);
    const matchRotacion =
      filterRotacion === 'TODOS' ? true : p.rotacion === filterRotacion;
    return matchSearch && matchRotacion;
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
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Reporte 2: Comportamiento y Rotación de Productos
          </h1>
          <p className="text-xs text-slate-500">
            Análisis comparativo de rotación (alta, media y baja demanda en góndolas).
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen de Rotación */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setFilterRotacion(filterRotacion === 'ALTA' ? 'TODOS' : 'ALTA')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            filterRotacion === 'ALTA'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`p-2 rounded-xl ${filterRotacion === 'ALTA' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
              <Flame className="w-5 h-5" />
            </span>
            <span className="text-2xl font-black">{data?.resumen?.altaRotacion || 0}</span>
          </div>
          <div className="mt-3 font-bold text-sm">Alta Rotación</div>
          <div className={`text-xs mt-0.5 ${filterRotacion === 'ALTA' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Promedio &ge; 30 piezas en anaquel
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterRotacion(filterRotacion === 'MEDIA' ? 'TODOS' : 'MEDIA')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            filterRotacion === 'MEDIA'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`p-2 rounded-xl ${filterRotacion === 'MEDIA' ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
              <Activity className="w-5 h-5" />
            </span>
            <span className="text-2xl font-black">{data?.resumen?.mediaRotacion || 0}</span>
          </div>
          <div className="mt-3 font-bold text-sm">Rotación Media / Estable</div>
          <div className={`text-xs mt-0.5 ${filterRotacion === 'MEDIA' ? 'text-blue-100' : 'text-slate-400'}`}>
            Flujo constante de colocación
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterRotacion(filterRotacion === 'BAJA' ? 'TODOS' : 'BAJA')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            filterRotacion === 'BAJA'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`p-2 rounded-xl ${filterRotacion === 'BAJA' ? 'bg-white/20' : 'bg-rose-50 text-rose-600'}`}>
              <Snowflake className="w-5 h-5" />
            </span>
            <span className="text-2xl font-black">{data?.resumen?.bajaRotacion || 0}</span>
          </div>
          <div className="mt-3 font-bold text-sm">Baja Rotación / Alerta</div>
          <div className={`text-xs mt-0.5 ${filterRotacion === 'BAJA' ? 'text-rose-100' : 'text-slate-400'}`}>
            Promedio &le; 10 piezas en anaquel
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
            placeholder="Buscar por producto o código..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid de Productos con Visualización de Desempeño */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Calculando comportamiento de rotación...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          No hay productos con los filtros seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((prod) => {
            const rotacionColor =
              prod.rotacion === 'ALTA'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : prod.rotacion === 'MEDIA'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-rose-50 text-rose-800 border-rose-200';

            const maxCapacity = 50;
            const barWidth = Math.min(100, Math.round((prod.promedioPorTienda / maxCapacity) * 100));

            return (
              <div
                key={prod.productoId}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center">
                      {prod.imagenUrl ? (
                        <img src={prod.imagenUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-slate-900 leading-snug">{prod.nombre}</h2>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {prod.codigoU} • {prod.codigoBarras}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${rotacionColor} shrink-0`}>
                    {prod.rotacion === 'ALTA' && '🔥 Alta'}
                    {prod.rotacion === 'MEDIA' && '⚡ Media'}
                    {prod.rotacion === 'BAJA' && '❄️ Baja'}
                  </span>
                </div>

                {/* Barra Visual de Promedio */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Promedio en Anaquel:</span>
                    <span className="font-bold text-slate-800">{prod.promedioPorTienda} unidades</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        prod.rotacion === 'ALTA'
                          ? 'bg-emerald-500'
                          : prod.rotacion === 'MEDIA'
                          ? 'bg-blue-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Historial Reciente */}
                {prod.historialReciente?.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Últimos conteos en tienda:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.historialReciente.map((h: any, i: number) => (
                        <div
                          key={i}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 flex items-center gap-1 shadow-2xs"
                        >
                          <span className="font-bold text-slate-900">{h.cantidad} uds</span>
                          <span className="text-slate-400">({h.tienda})</span>
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
    </div>
  );
}
