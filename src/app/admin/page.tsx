import React from 'react';
import { prisma } from '@/lib/prisma';
import {
  Building2,
  Store,
  Package,
  Users,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    totalEmpresas,
    totalProductos,
    totalTiendas,
    colocadorasActivas,
    colocadorasInactivas,
  ] = await Promise.all([
    prisma.empresa.count({ where: { activo: true } }),
    prisma.producto.count({ where: { activo: true } }),
    prisma.tienda.count({ where: { activa: true } }),
    prisma.colocadoraProfile.count({ where: { estado: 'ACTIVA' } }),
    prisma.colocadoraProfile.count({ where: { estado: 'INACTIVA' } }),
  ]);

  const stats = [
    {
      label: 'Empresas Registradas',
      value: totalEmpresas,
      icon: Building2,
      href: '/admin/empresas',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Supermercados / Tiendas',
      value: totalTiendas,
      icon: Store,
      href: '/admin/tiendas',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'Productos en Catálogo',
      value: totalProductos,
      icon: Package,
      href: '/admin/productos',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Colocadoras Activas',
      value: colocadorasActivas,
      subValue: `${colocadorasInactivas} inactivas`,
      icon: Users,
      href: '/admin/colocadoras',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  const quickActions = [
    {
      title: 'Registrar Empresa',
      desc: 'Crear proveedor y habilitar acceso al portal cliente',
      href: '/admin/empresas',
      icon: Building2,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      title: 'Ingresar Producto',
      desc: 'Registrar producto con Código U, Código de barras y foto',
      href: '/admin/productos',
      icon: Package,
      color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    {
      title: 'Nueva Contratación',
      desc: 'Alta de colocadora con DPI y asignación de tiendas',
      href: '/admin/colocadoras',
      icon: Users,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      title: 'Nueva Tienda',
      desc: 'Agregar nuevo supermercado o punto de venta',
      href: '/admin/tiendas',
      icon: Store,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Panel Administrativo
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Control de Operaciones
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Supervisa la colocación de productos, gestión de personal en supermercados y entidades de Comercializadora Los Altos.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <Link
              key={st.label}
              href={st.href}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500">{st.label}</div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    {st.value}
                  </div>
                  {st.subValue && (
                    <div className="text-[11px] text-slate-400 mt-0.5">{st.subValue}</div>
                  )}
                </div>
                <div className={`p-3 rounded-xl border ${st.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
                <span>Gestionar</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Accesos Rápidos de Creación */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.title}
                href={act.href}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {act.desc}
                  </p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                  <span>Abrir</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
