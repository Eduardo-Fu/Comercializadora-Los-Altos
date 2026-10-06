'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Store,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
  Tag,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface InventarioRegistro {
  id: string;
  fecha: string;
  observaciones: string | null;
  tienda: { id: string; nombre: string; ciudad: string | null };
  empresa: { id: string; nombre: string };
  colocadora: { id: string; nombre: string };
  detalles: {
    id: string;
    cantidadFisica: number;
    producto: {
      id: string;
      nombre: string;
      codigoU: string;
      codigoBarras: string;
      imagenUrl: string | null;
    };
  }[];
}

export default function ColocadoraHistorialPage() {
  const [historial, setHistorial] = useState<InventarioRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistorial() {
      try {
        setLoading(true);
        const res = await fetch('/api/colocadora/historial');
        const data = await res.json();
        if (data.success) {
          setHistorial(data.historial);
          if (data.historial.length > 0) {
            setExpandedId(data.historial[0].id); // Expand first by default
          }
        }
      } catch (err) {
        console.error('Error cargando historial:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistorial();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/colocadora"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-6 h-6 text-blue-600" />
              Historial de Inventarios
            </h1>
            <p className="text-xs text-slate-500">
              Consultas de los inventarios físicos enviados en tus visitas.
            </p>
          </div>
        </div>

        <Link
          href="/colocadora/inventario"
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shrink-0"
        >
          + Nuevo Conteo
        </Link>
      </div>

      {/* Listado */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Cargando historial de inventarios...</span>
        </div>
      ) : historial.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          Aún no has registrado inventarios. Dirígete a &quot;Ingreso de Inventario&quot; para comenzar.
        </div>
      ) : (
        <div className="space-y-4">
          {historial.map((reg) => {
            const isExpanded = expandedId === reg.id;
            const totalPiezas = reg.detalles.reduce((acc, d) => acc + d.cantidadFisica, 0);

            return (
              <div
                key={reg.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Cabecera del Registro */}
                <div
                  onClick={() => toggleExpand(reg.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Store className="w-3.5 h-3.5 text-amber-600" />
                        {reg.tienda.nombre}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {reg.empresa.nombre}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(reg.fecha)}</span>
                      {reg.observaciones && (
                        <span className="italic text-slate-400 ml-2">
                          — &quot;{reg.observaciones}&quot;
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Contado</div>
                      <div className="text-base font-bold text-emerald-700">
                        {totalPiezas} piezas
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalle Desplegable de Productos */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Detalle de Productos ({reg.detalles.length})
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {reg.detalles.map((det) => (
                        <div
                          key={det.id}
                          className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center">
                              {det.producto.imagenUrl ? (
                                <img
                                  src={det.producto.imagenUrl}
                                  alt={det.producto.nombre}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-800 truncate">
                                {det.producto.nombre}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {det.producto.codigoU}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                              {det.cantidadFisica} uds
                            </span>
                          </div>
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
