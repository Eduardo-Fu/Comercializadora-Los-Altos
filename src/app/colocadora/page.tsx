import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  ClipboardList,
  History,
  AlertTriangle,
  CalendarClock,
  Store,
  ArrowRight,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ColocadoraHomePage() {
  const user = await getCurrentUser();

  let colocadoraProfile = null;
  let totalInventarios = 0;
  let totalMermas = 0;

  if (user?.role === 'COLOCADORA') {
    colocadoraProfile = await prisma.colocadoraProfile.findUnique({
      where: { userId: user.userId },
      include: {
        tiendasAsignadas: {
          include: { tienda: true },
        },
      },
    });

    if (colocadoraProfile) {
      [totalInventarios, totalMermas] = await Promise.all([
        prisma.inventarioRegistro.count({ where: { colocadoraId: colocadoraProfile.id } }),
        prisma.productoMalEstado.count({ where: { colocadoraId: colocadoraProfile.id } }),
      ]);
    }
  }

  const options = [
    {
      title: 'Ingreso de Inventario',
      description: 'Registrar conteo físico de productos por supermercado y empresa.',
      icon: ClipboardList,
      href: '/colocadora/inventario',
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      badge: 'Principal',
    },
    {
      title: 'Historial de Inventarios',
      description: 'Consultar y revisar los inventarios enviados previamente.',
      icon: History,
      href: '/colocadora/historial',
      color: 'bg-blue-500/10 text-blue-700 border-blue-200',
      count: totalInventarios > 0 ? `${totalInventarios} enviados` : undefined,
    },
    {
      title: 'Producto en Mal Estado',
      description: 'Reportar mermas o productos dañados con fotografía y descripción.',
      icon: AlertTriangle,
      href: '/colocadora/mal-estado',
      color: 'bg-rose-500/10 text-rose-700 border-rose-200',
      count: totalMermas > 0 ? `${totalMermas} reportes` : undefined,
    },
    {
      title: 'Fecha de Vencimiento',
      description: 'Registrar lotes y fechas de caducidad para análisis de rotación.',
      icon: CalendarClock,
      href: '/colocadora/vencimientos',
      color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-emerald-500/30 border border-emerald-400/30 rounded-full text-[11px] font-semibold tracking-wider uppercase text-emerald-200">
            Operaciones en Tienda
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Hola, {user?.name || 'Colocadora'}
        </h1>
        <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-lg">
          Selecciona una de las tareas para registrar la colocación en tus supermercados asignados.
        </p>

        {/* Tiendas Asignadas */}
        {colocadoraProfile?.tiendasAsignadas && colocadoraProfile.tiendasAsignadas.length > 0 && (
          <div className="mt-5 pt-4 border-t border-emerald-700/50">
            <div className="text-[11px] font-semibold text-emerald-200/90 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> Tus Supermercados Asignados:
            </div>
            <div className="flex flex-wrap gap-2">
              {colocadoraProfile.tiendasAsignadas.map((item) => (
                <div
                  key={item.tienda.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-600/40 rounded-xl text-xs text-white"
                >
                  <MapPin className="w-3 h-3 text-emerald-300" />
                  <span>{item.tienda.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid de Opciones del Menú */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <Link
              key={opt.title}
              href={opt.href}
              className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${opt.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {opt.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {opt.badge}
                    </span>
                  )}
                  {opt.count && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                      {opt.count}
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {opt.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
                <span>Ingresar</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
