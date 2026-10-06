'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Store,
  Calendar,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function EmpresaSugeridosPage() {
  const [sugeridos, setSugeridos] = useState<any[]>([]);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchSugeridos() {
      try {
        setLoading(true);
        const res = await fetch('/api/empresa/reportes/sugeridos');
        const json = await res.json();
        if (json.success) {
          setSugeridos(json.sugeridos);
          setTotalUnidades(json.totalUnidadesSugeridas || 0);
        }
      } catch (err) {
        console.error('Error cargando sugeridos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSugeridos();
  }, []);

  const filtered = sugeridos.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.producto.nombre.toLowerCase().includes(term) ||
      s.producto.codigoU.toLowerCase().includes(term) ||
      s.tienda.nombre.toLowerCase().includes(term) ||
      (s.notas && s.notas.toLowerCase().includes(term))
    );
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
            <History className="w-6 h-6 text-indigo-600" />
            Reporte 4: Historial de Pedidos Sugeridos
          </h1>
          <p className="text-xs text-slate-500">
            Recomendaciones de compra y reabastecimiento generadas por supermercado.
          </p>
        </div>
      </div>

      {/* Tarjeta de Resumen */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-indigo-200 font-semibold uppercase tracking-wider">
            Total Piezas Sugeridas para Reposición
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {totalUnidades} <span className="text-sm font-normal text-indigo-200">unidades calculadas</span>
          </div>
        </div>
        <div className="text-xs text-indigo-100 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
          {filtered.length} sugeridos emitidos
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto, tienda o notas..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabla de Sugeridos */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs">Cargando pedidos sugeridos...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          No hay pedidos sugeridos registrados para tu catálogo.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Producto</th>
                  <th className="px-5 py-3.5">Supermercado</th>
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
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{sug.tienda.nombre}</div>
                      {sug.tienda.ciudad && <div className="text-[11px] text-slate-400">{sug.tienda.ciudad}</div>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold font-mono">
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
    </div>
  );
}
