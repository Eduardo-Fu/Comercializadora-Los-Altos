import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  CalendarClock,
  History,
  Building2,
  ArrowRight,
  Package,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EmpresaPortalPage() {
  const user = await getCurrentUser();

  let empresaInfo = null;
  let totalProductos = 0;
  let totalMermas = 0;
  let totalSugeridos = 0;

  if (user?.role === 'EMPRESA' && user.empresaId) {
    empresaInfo = await prisma.empresa.findUnique({
      where: { id: user.empresaId },
    });

    [totalProductos, totalMermas, totalSugeridos] = await Promise.all([
      prisma.producto.count({ where: { empresaId: user.empresaId, activo: true } }),
      prisma.productoMalEstado.count({ where: { empresaId: user.empresaId } }),
      prisma.sugeridoRegistro.count({ where: { empresaId: user.empresaId } }),
    ]);
  } else if (user?.role === 'ADMIN') {
    [totalProductos, totalMermas, totalSugeridos] = await Promise.all([
      prisma.producto.count({ where: { activo: true } }),
      prisma.productoMalEstado.count(),
      prisma.sugeridoRegistro.count(),
    ]);
  }

  const reportes = [
    {
      id: '1',
      title: '1. Existencia Actual en Góndola',
      description: 'Consulta de existencias físicas por supermercado o producto con exportación a Excel/CSV.',
      icon: Layers,
      href: '/empresa/existencias',
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      badge: 'Stock en Tienda',
    },
    {
      id: '2',
      title: '2. Comportamiento y Rotación',
      description: 'Análisis de rotación de productos (alta vs baja rotación) con gráficas interactivas.',
      icon: TrendingUp,
      href: '/empresa/comportamiento',
      color: 'bg-blue-500/10 text-blue-700 border-blue-200',
      badge: 'Analítica',
    },
    {
      id: '3',
      title: '3. Mal Estado y Mermas',
      description: 'Reporte consolidado de productos dañados con evidencias fotográficas y motivos.',
      icon: AlertTriangle,
      href: '/empresa/mermas',
      color: 'bg-rose-500/10 text-rose-700 border-rose-200',
      count: totalMermas > 0 ? `${totalMermas} incidencias` : undefined,
    },
    {
      id: '4',
      title: '4. Historial de Pedidos Sugeridos',
      description: 'Registro de pedidos sugeridos de compra y reabastecimiento generados por tienda.',
      icon: History,
      href: '/empresa/sugeridos',
      color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
      count: totalSugeridos > 0 ? `${totalSugeridos} sugeridos` : undefined,
    },
    {
      id: '5',
      title: '5. Semáforo de Fechas de Vencimiento',
      description: 'Control preventivo de caducidades con alertas por proximidad de vencimiento.',
      icon: CalendarClock,
      href: '/empresa/vencimientos',
      color: 'bg-amber-500/10 text-amber-700 border-amber-200',
      badge: 'Preventivo',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-[11px] font-semibold tracking-wider uppercase text-indigo-200">
            Portal de Clientes
          </span>
          <span className="px-3 py-1 bg-emerald-500/30 border border-emerald-400/30 rounded-full text-[11px] font-semibold tracking-wider uppercase text-emerald-200">
            Comercializadora Los Altos
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {empresaInfo?.nombre || user?.name || 'Portal de Empresa'}
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
          Visualiza los 5 reportes analíticos estratégicos sobre la colocación, existencia física y estado de tus productos en los supermercados independientes.
        </p>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="text-[11px] text-slate-400">Productos en Catálogo</div>
            <div className="text-lg sm:text-xl font-bold text-white mt-0.5">{totalProductos}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="text-[11px] text-slate-400">Mermas Reportadas</div>
            <div className="text-lg sm:text-xl font-bold text-rose-400 mt-0.5">{totalMermas}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-400">Sugeridos Registrados</div>
            <div className="text-lg sm:text-xl font-bold text-indigo-400 mt-0.5">{totalSugeridos}</div>
          </div>
        </div>
      </div>

      {/* Grid de los 5 Reportes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportes.map((rep) => {
          const Icon = rep.icon;
          return (
            <Link
              key={rep.id}
              href={rep.href}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${rep.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {rep.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {rep.badge}
                    </span>
                  )}
                  {rep.count && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      {rep.count}
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {rep.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {rep.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                <span>Ver Reporte</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
