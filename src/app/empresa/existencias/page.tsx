'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Store,
  Building2,
  Package,
  Download,
  Printer,
  ArrowLeft,
  Loader2,
  Calendar,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function EmpresaExistenciasPage() {
  const [existencias, setExistencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTienda, setSelectedTienda] = useState('');

  const fetchExistencias = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/empresa/reportes/existencias');
      const data = await res.json();
      if (data.success) {
        setExistencias(data.existencias);
      }
    } catch (err) {
      console.error('Error cargando existencias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistencias();
  }, []);

  // Extraer tiendas únicas para filtro
  const tiendasUnicas = Array.from(new Set(existencias.map((e) => e.tiendaNombre)));

  const filtered = existencias.filter((item) => {
    const term = search.toLowerCase();
    const matchSearch =
      item.productoNombre.toLowerCase().includes(term) ||
      item.codigoU.toLowerCase().includes(term) ||
      item.codigoBarras.toLowerCase().includes(term);
    const matchTienda = selectedTienda ? item.tiendaNombre === selectedTienda : true;
    return matchSearch && matchTienda;
  });

  // Exportar a CSV / Excel
  const exportToCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['Supermercado', 'Ciudad', 'Producto', 'Codigo U', 'Codigo de Barras', 'Existencia Actual', 'Ultima Actualizacion', 'Colocadora'];
    const rows = filtered.map((item) => [
      `"${item.tiendaNombre}"`,
      `"${item.ciudad || ''}"`,
      `"${item.productoNombre}"`,
      `"${item.codigoU}"`,
      `"${item.codigoBarras}"`,
      item.existenciaActual,
      `"${item.ultimaActualizacion ? formatDate(item.ultimaActualizacion) : 'Sin registro'}"`,
      `"${item.colocadoraNombre || 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_existencias_losaltos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalUnidades = filtered.reduce((acc, item) => acc + item.existenciaActual, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/empresa"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition active:scale-95 print:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-600" />
              Reporte 1: Existencia Actual en Góndola
            </h1>
            <p className="text-xs text-slate-500">
              Inventario físico en tiempo real por supermercado y producto.
            </p>
          </div>
        </div>

        {/* Botones de Exportación */}
        <div className="flex items-center gap-2 print:hidden self-start sm:self-auto">
          <button
            onClick={exportToCSV}
            disabled={filtered.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Tarjeta de Resumen */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">
            Total Existencias en Tiendas
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {totalUnidades} <span className="text-sm font-normal text-emerald-100">unidades en góndola</span>
          </div>
        </div>
        <div className="text-xs text-emerald-100 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
          Mostrando {filtered.length} ubicaciones / registros
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto, Código U o barras..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedTienda}
          onChange={(e) => setSelectedTienda(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">Todos los Supermercados</option>
          {tiendasUnicas.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de Existencias */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs">Cargando existencias en tiendas...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          No se encontraron existencias con los filtros seleccionados.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Producto</th>
                  <th className="px-5 py-3.5">Supermercado</th>
                  <th className="px-5 py-3.5 text-center">Existencia Física</th>
                  <th className="px-5 py-3.5">Última Actualización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center">
                          {item.imagenUrl ? (
                            <img src={item.imagenUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.productoNombre}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {item.codigoU} • {item.codigoBarras}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">{item.tiendaNombre}</div>
                      {item.ciudad && <div className="text-[11px] text-slate-400">{item.ciudad}</div>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${
                          item.existenciaActual === 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.existenciaActual < 10
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.existenciaActual} uds
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {item.ultimaActualizacion ? (
                        <div>
                          <div>{formatDate(item.ultimaActualizacion)}</div>
                          {item.colocadoraNombre && (
                            <div className="text-[10px] text-slate-400">Por: {item.colocadoraNombre}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pendiente de visita</span>
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
