import React, { useState, useEffect } from 'react';
import {
  Server,
  Terminal,
  Database,
  Copy,
  Check,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Trash2,
  Table,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  clearStoredSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';

interface DeploymentGuideViewProps {
  onConfigChange?: () => void;
}

export const DeploymentGuideView: React.FC<DeploymentGuideViewProps> = ({ onConfigChange }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Supabase state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'visual' | 'sql'>('visual');

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setSupabaseUrl(config.url || '');
    setSupabaseKey(config.key || '');
  }, []);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor ingresa tanto la URL de tu proyecto como la API Key de Supabase.',
      });
      return;
    }

    setIsTesting(true);
    const result = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setIsTesting(false);

    if (result.success) {
      saveStoredSupabaseConfig(supabaseUrl, supabaseKey);
      setFeedback({
        type: 'success',
        message: '¡Conexión establecida exitosamente! Tus datos ahora se sincronizarán con tu base de datos Supabase.',
      });
      if (onConfigChange) onConfigChange();
    } else {
      setFeedback({
        type: 'error',
        message: result.message,
      });
    }
  };

  const handleDisconnect = () => {
    clearStoredSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setFeedback({
      type: 'success',
      message: 'Desconectado de Supabase. El sistema ha vuelto al modo de demostración local segura.',
    });
    if (onConfigChange) onConfigChange();
  };

  const isConfigured = Boolean(supabaseUrl && supabaseKey);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-purple-900/40 p-6 sm:p-8 rounded-2xl border border-blue-500/20 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold mb-3 border border-blue-500/30">
          <Terminal className="w-3.5 h-3.5" />
          Guía Oficial de Despliegue y Conexión de Base de Datos
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Despliegue y Conexión con Supabase
        </h1>
        <p className="text-slate-300 text-sm mt-2 max-w-3xl leading-relaxed">
          Comercializadora Los Altos incluye un sistema completo de persistencia local y soporte para vincular tu
          propia base de datos de <strong className="text-white">Supabase / PostgreSQL</strong> en tiempo real.
        </p>
      </div>

      {/* Supabase Interactive Connector Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white">Conecta tu Propia Base de Datos Supabase</h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isConfigured
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
                    }`}
                  />
                  {isConfigured ? 'Conectado a tu Supabase' : 'Modo Demo Local (Activo)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Coloca la URL y la API Key pública (Anon Key) de tu proyecto de Supabase para almacenar tus datos reales.
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 transition"
          >
            <span>Abrir Dashboard de Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-3 mb-6 border transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/60 border-red-500/40 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form to insert custom keys */}
        <form onSubmit={handleSaveAndTest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                URL del Proyecto Supabase (Project URL)
              </label>
              <input
                type="url"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://tu-proyecto.supabase.co"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Lo encuentras en Supabase: Settings → API → Project URL
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Supabase API Key (Anon / Publishable Key)
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  {showKey ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  required
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="sb_publishable_... o eyJhbGciOi..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 font-mono pr-10"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Lo encuentras en Supabase: Settings → API → anon / public key
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isTesting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verificando conexión...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar y Probar Conexión</span>
                </>
              )}
            </button>

            {isConfigured && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 text-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Desconectar (Volver a Modo Demo)</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Mapped Tables & SQL Schema Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Estructura de Tablas Mapeadas de Ejemplo</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Esquema relacional de las 6 tablas requeridas por la aplicación para sincronizar existencias, catálogo y campo.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSchemaTab('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeSchemaTab === 'visual'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vista de Tablas
            </button>
            <button
              type="button"
              onClick={() => setActiveSchemaTab('sql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeSchemaTab === 'sql'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Script SQL (DDL)
            </button>
          </div>
        </div>

        {activeSchemaTab === 'visual' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Table: Tiendas */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-emerald-400">tiendas</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Puntos de Venta</span>
              </div>
              <div className="text-slate-300 text-xs space-y-1 font-mono">
                <div>• id <span className="text-slate-500">(uuid, PK)</span></div>
                <div>• nombre <span className="text-slate-500">(text)</span></div>
                <div>• creado_en <span className="text-slate-500">(timestamptz)</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Ejemplos:</strong> Supermercado Gran Gallo, Más y Más, Espiga de Oro.
              </div>
            </div>

            {/* Table: Empresas */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-emerald-400">empresas</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Marcas Proveedoras</span>
              </div>
              <div className="text-slate-300 text-xs space-y-1 font-mono">
                <div>• id <span className="text-slate-500">(uuid, PK)</span></div>
                <div>• nombre <span className="text-slate-500">(text)</span></div>
                <div>• creado_en <span className="text-slate-500">(timestamptz)</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Ejemplos:</strong> Irex de Guatemala, Tío Nacho, Los Altos.
              </div>
            </div>

            {/* Table: Productos */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-emerald-400">productos</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Catálogo Maestro</span>
              </div>
              <div className="text-slate-300 text-xs space-y-1 font-mono">
                <div>• id <span className="text-slate-500">(uuid, PK)</span></div>
                <div>• empresa_id <span className="text-slate-500">(uuid, FK)</span></div>
                <div>• nombre <span className="text-slate-500">(text)</span></div>
                <div>• codigo_u, codigo_barras <span className="text-slate-500">(text)</span></div>
                <div>• url_imagen <span className="text-slate-500">(text)</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Ejemplos:</strong> Detergente Orix 1kg, Limpiador Irex Lavanda.
              </div>
            </div>

            {/* Table: Colocadoras */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-emerald-400">colocadoras</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Personal de Campo</span>
              </div>
              <div className="text-slate-300 text-xs space-y-1 font-mono">
                <div>• id <span className="text-slate-500">(uuid, PK)</span></div>
                <div>• nombre, dpi <span className="text-slate-500">(text)</span></div>
                <div>• tiendas_asignadas <span className="text-slate-500">(text)</span></div>
                <div>• fecha_contratacion <span className="text-slate-500">(date)</span></div>
                <div>• estado <span className="text-slate-500">(ACTIVA/INACTIVA)</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Ejemplos:</strong> María Gómez (DPI: 2987123450101).
              </div>
            </div>

            {/* Table: Inventarios */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-emerald-400">inventarios</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Conteos Físicos</span>
              </div>
              <div className="text-slate-300 text-xs space-y-1 font-mono">
                <div>• id <span className="text-slate-500">(uuid, PK)</span></div>
                <div>• colocadora_id <span className="text-slate-500">(uuid, FK)</span></div>
                <div>• tienda_id, producto_id <span className="text-slate-500">(uuid, FK)</span></div>
                <div>• cantidad <span className="text-slate-500">(int4)</span></div>
                <div>• fecha_registro <span className="text-slate-500">(timestamptz)</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Ejemplos:</strong> Registro de 48 unidades en góndola.
              </div>
            </div>

            {/* Table: Mermas */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-emerald-400">mermas</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Productos Dañados</span>
              </div>
              <div className="text-slate-300 text-xs space-y-1 font-mono">
                <div>• id <span className="text-slate-500">(uuid, PK)</span></div>
                <div>• empresa_id <span className="text-slate-500">(uuid, FK)</span></div>
                <div>• descripcion <span className="text-slate-500">(text)</span></div>
                <div>• url_fotografia <span className="text-slate-500">(text)</span></div>
                <div>• fecha_reporte <span className="text-slate-500">(timestamptz)</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Ejemplos:</strong> Empaque roto con evidencia fotográfica.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Copia este script y pégalo directamente en el <strong>SQL Editor</strong> de tu proyecto Supabase:
              </span>
              <button
                type="button"
                onClick={() => copyCode(SUPABASE_SQL_SCHEMA, 'sql_schema')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs transition"
              >
                {copiedId === 'sql_schema' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Copiado al portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Script SQL Completo</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto max-h-96">
              <code>{SUPABASE_SQL_SCHEMA}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Demo Credentials Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Credenciales Incluidas en el Modo Demo</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Administrador
            </span>
            <div className="text-xs text-slate-200 font-mono mt-2.5">admin@losaltos.com</div>
            <div className="text-xs text-slate-400 font-mono">admin123</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Colocadora de Campo
            </span>
            <div className="text-xs text-slate-200 font-mono mt-2.5">colocadora@losaltos.com</div>
            <div className="text-xs text-slate-400 font-mono">colocadora123</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Empresa Proveedora (Irex)
            </span>
            <div className="text-xs text-slate-200 font-mono mt-2.5">irex@comercializadoralosaltos.com</div>
            <div className="text-xs text-slate-400 font-mono">empresa123</div>
          </div>
        </div>
      </div>
    </div>
  );
};
