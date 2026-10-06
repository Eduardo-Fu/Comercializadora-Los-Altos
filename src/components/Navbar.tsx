'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Store, Shield, User, Building2 } from 'lucide-react';

interface NavbarProps {
  userName?: string;
  userRole?: 'ADMIN' | 'COLOCADORA' | 'EMPRESA';
  title?: string;
}

export default function Navbar({ userName, userRole, title }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Error al cerrar sesión', e);
    }
  };

  const getRoleBadge = () => {
    switch (userRole) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Shield className="w-3 h-3" /> Administrador
          </span>
        );
      case 'COLOCADORA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Store className="w-3 h-3" /> Colocadora
          </span>
        );
      case 'EMPRESA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <Building2 className="w-3 h-3" /> Empresa Cliente
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              Los Altos
            </div>
            <div className="text-[11px] text-slate-500 hidden sm:block">
              {title || 'Gestión de Inventarios y Colocación'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getRoleBadge()}
          {userName && (
            <div className="text-xs text-slate-700 font-medium hidden md:block">
              {userName}
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
