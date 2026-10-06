import React, { useState } from 'react';
import { Store, Shield, Users, Building2, LogIn, AlertCircle } from 'lucide-react';
import { User, Role } from '../data/mockData';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'admin@losaltos.com') {
      onLogin({
        id: 'usr_admin',
        email: 'admin@losaltos.com',
        name: 'Rodrigo López (Administrador)',
        role: 'ADMIN',
      });
      return;
    }

    if (cleanEmail === 'colocadora@losaltos.com') {
      onLogin({
        id: 'usr_colocadora_1',
        email: 'colocadora@losaltos.com',
        name: 'María Gómez (Colocadora)',
        role: 'COLOCADORA',
        colocadoraId: 'coloc_1',
      });
      return;
    }

    if (cleanEmail === 'irex@comercializadoralosaltos.com') {
      onLogin({
        id: 'usr_empresa_1',
        email: 'irex@comercializadoralosaltos.com',
        name: 'Representante Irex',
        role: 'EMPRESA',
        empresaId: 'emp_1',
      });
      return;
    }

    setError('Credenciales no reconocidas. Usa los accesos rápidos de demostración abajo.');
  };

  const handleQuickLogin = (role: Role) => {
    if (role === 'ADMIN') {
      onLogin({
        id: 'usr_admin',
        email: 'admin@losaltos.com',
        name: 'Rodrigo López (Administrador)',
        role: 'ADMIN',
      });
    } else if (role === 'COLOCADORA') {
      onLogin({
        id: 'usr_colocadora_1',
        email: 'colocadora@losaltos.com',
        name: 'María Gómez (Colocadora)',
        role: 'COLOCADORA',
        colocadoraId: 'coloc_1',
      });
    } else {
      onLogin({
        id: 'usr_empresa_1',
        email: 'irex@comercializadoralosaltos.com',
        name: 'Representante Irex',
        role: 'EMPRESA',
        empresaId: 'emp_1',
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Encabezado Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Comercializadora Los Altos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sistema Web de Control de Inventarios y Colocación
          </p>
        </div>

        {/* Tarjeta de Inicio de Sesión */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Iniciar Sesión</h2>
            <p className="text-xs text-slate-400">Ingresa tus credenciales para acceder a tu portal</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@losaltos.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
            >
              <LogIn className="w-4 h-4" />
              Ingresar al Sistema
            </button>
          </form>

          {/* Accesos Rápidos de Prueba */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-3">
              Credenciales de Demostración (Haz clic para entrar):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Admin</div>
                  <div className="text-[10px] text-slate-400">admin123</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('COLOCADORA')}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Colocadora</div>
                  <div className="text-[10px] text-slate-400">colocadora123</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('EMPRESA')}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Empresa</div>
                  <div className="text-[10px] text-slate-400">empresa123</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Comercializadora Los Altos • Fraijanes, Guatemala
        </p>
      </div>
    </main>
  );
};
