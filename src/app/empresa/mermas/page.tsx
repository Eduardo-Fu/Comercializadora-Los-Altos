'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Store,
  Calendar,
  ArrowLeft,
  Loader2,
  Eye,
  X,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function EmpresaMermasPage() {
  const [mermas, setMermas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMermas() {
      try {
        setLoading(true);
        const res = await fetch('/api/empresa/reportes/mermas');
        const json = await res.json();
        if (json.success) {
          setMermas(json.mermas);
        }
      } catch (err) {
        console.error('Error cargando mermas:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMermas();
  }, []);

  const filtered = mermas.filter((m) => {
    const term = search.toLowerCase();
    return (
      m.producto.nombre.toLowerCase().includes(term) ||
      m.producto.codigoU.toLowerCase().includes(term) ||
      m.tienda.nombre.toLowerCase().includes(term) ||
      m.descripcion.toLowerCase().includes(term)
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
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Reporte 3: Mermas y Productos en Mal Estado
          </h1>
          <p className="text-xs text-slate-500">
            Evidencias fotográficas y causas de daño reportadas durante la colocación en supermercados.
          </p>
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
            placeholder="Buscar por producto, supermercado o motivo del daño..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid de Reportes de Merma */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
          <span className="text-xs">Cargando reporte de mermas...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          No hay reportes de productos en mal estado registrados para tu empresa.
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
                  className="relative h-48 bg-slate-100 cursor-pointer group overflow-hidden border-b border-slate-100"
                >
                  <img
                    src={item.imagenUrl}
                    alt={item.producto.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-3 py-1.5 bg-white/90 rounded-xl text-xs font-bold text-slate-900 shadow-lg flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-rose-600" /> Ampliar Foto
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 leading-snug">
                      {item.producto.nombre}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {formatDate(item.fecha)}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    {item.producto.codigoU} • {item.producto.codigoBarras}
                  </div>

                  <div className="text-xs text-slate-700 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800 mb-1">
                      Descripción de lo Sucedido:
                    </div>
                    &quot;{item.descripcion}&quot;
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Store className="w-3.5 h-3.5 text-amber-600" /> {item.tienda.nombre}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" /> {item.colocadora?.nombre || 'Colocadora'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
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
    </div>
  );
}
