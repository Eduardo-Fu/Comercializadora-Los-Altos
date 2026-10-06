import React from 'react';
import { Store, Shield, Users, Building2, BookOpen, LogOut, RefreshCw, Database } from 'lucide-react';
import { User, Role } from '../data/mockData';

interface NavbarProps {
  currentUser: User | null;
  onSelectRole: (role: Role) => void;
  onOpenDeploymentGuide: () => void;
  onLogout: () => void;
  onResetData: () => void;
  activeTab: string;
  supabaseConnected?: boolean;
  isSyncing?: boolean;
  onSyncSupabase?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectRole,
  onOpenDeploymentGuide,
  onLogout,
  onResetData,
  activeTab,
  supabaseConnected = true,
  isSyncing = false,
  onSyncSupabase,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">Comercializadora Los Altos</span>
                {/* Connection badge */}
                {supabaseConnected ? (
                  <button
                    type="button"
                    onClick={onSyncSupabase}
                    title="Sincronizado con Supabase"
                    className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Database className="w-3 h-3" />
                    <span>Supabase Live</span>
                    {isSyncing && <RefreshCw className="w-2.5 h-2.5 animate-spin ml-0.5" />}
                  </button>
                ) : (
                  <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Preview Activa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Control de Inventarios y Colocación</p>
            </div>
          </div>

          {/* Quick Role Switcher Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => onSelectRole('ADMIN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentUser?.role === 'ADMIN' && activeTab !== 'despliegue'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('COLOCADORA')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentUser?.role === 'COLOCADORA' && activeTab !== 'despliegue'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Colocadora
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('EMPRESA')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentUser?.role === 'EMPRESA' && activeTab !== 'despliegue'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Empresa
              </button>
            </div>

            {/* Sincronizar Supabase Botón */}
            {onSyncSupabase && (
              <button
                type="button"
                onClick={onSyncSupabase}
                disabled={isSyncing}
                title="Sincronizar datos con Supabase ahora"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sync Supabase'}</span>
              </button>
            )}

            {/* Guía de Despliegue */}
            <button
              type="button"
              onClick={onOpenDeploymentGuide}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                activeTab === 'despliegue'
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Despliegue & Supabase</span>
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={onLogout}
              title="Cerrar sesión"
              className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
