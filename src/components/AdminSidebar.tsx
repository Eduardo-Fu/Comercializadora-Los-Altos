'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Store,
  Package,
  Users,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  CalendarClock,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';

const catalogNav = [
  { name: 'Dashboard General', href: '/admin', icon: LayoutDashboard },
  { name: 'Empresas Proveedoras', href: '/admin/empresas', icon: Building2 },
  { name: 'Supermercados / Tiendas', href: '/admin/tiendas', icon: Store },
  { name: 'Catálogo de Productos', href: '/admin/productos', icon: Package },
  { name: 'Equipo de Colocadoras', href: '/admin/colocadoras', icon: Users },
];

const operationsNav = [
  { name: 'Inventarios Globales', href: '/admin/inventario', icon: ClipboardList },
  { name: 'Pedidos Sugeridos', href: '/admin/sugeridos', icon: TrendingUp },
  { name: 'Mermas y Mal Estado', href: '/admin/mermas', icon: AlertTriangle },
  { name: 'Control Vencimientos', href: '/admin/vencimientos', icon: CalendarClock },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Botón flotante para abrir sidebar en pantallas móviles */}
      <div className="lg:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-3.5 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 flex items-center justify-center transition-transform active:scale-95"
          aria-label="Abrir Menú"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay oscuro para móvil */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-100">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Administración Central
          </div>
          <div className="text-sm font-semibold text-slate-800 mt-0.5">
            Comercializadora Los Altos
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {/* Sección Catálogos */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Catálogos & Personal
            </div>
            {catalogNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Sección Operaciones & Auditoría */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Operaciones & Inventarios
            </div>
            {operationsNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          Los Altos Admin v1.0 • Web Responsive
        </div>
      </aside>
    </>
  );
}
