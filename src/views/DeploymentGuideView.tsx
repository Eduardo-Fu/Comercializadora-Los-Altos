import React, { useState } from 'react';
import {
  Server,
  Terminal,
  Database,
  Globe,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  FileCode,
  ExternalLink,
} from 'lucide-react';

export const DeploymentGuideView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-purple-900/40 p-6 sm:p-8 rounded-2xl border border-blue-500/20 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold mb-3 border border-blue-500/30">
          <Terminal className="w-3.5 h-3.5" />
          Guía Oficial de Despliegue y Ejecución
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          ¿Cómo ejecutar y desplegar Los Altos Proto?
        </h1>
        <p className="text-slate-300 text-sm mt-2 max-w-3xl leading-relaxed">
          Tu proyecto <strong className="text-white">Losaltosproto</strong> está completamente implementado con Next.js 14,
          Prisma, PostgreSQL y Docker. Aquí tienes las 3 formas probadas de ponerlo en marcha.
        </p>
      </div>

      {/* Grid of 3 Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Method 1: Docker Compose */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/40 transition">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Docker Compose (Recomendado)</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Levanta automáticamente la base de datos PostgreSQL, aplica migraciones y compila la aplicación en un solo comando sin instalar nada más.
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 relative">
            <code>docker compose up --build</code>
            <button
              onClick={() => copyCode('docker compose up --build', 'm1')}
              className="absolute right-2 top-2 text-slate-400 hover:text-white p-1"
            >
              {copiedId === 'm1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Method 2: Node.js + Neon DB */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Local con Node.js</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Para desarrollar en tu máquina usando npm, ejecutando el servidor de Next.js y conectándolo a PostgreSQL local o nube.
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 relative">
            <code>npm install && npm run dev</code>
            <button
              onClick={() => copyCode('npm install && npm run dev', 'm2')}
              className="absolute right-2 top-2 text-slate-400 hover:text-white p-1"
            >
              {copiedId === 'm2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Method 3: Cloud Vercel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Despliegue en la Nube (Vercel)</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Despliega tu app en HTTPS gratis con Vercel conectada a una base de datos PostgreSQL Serverless gratuita (Neon.tech o Supabase).
            </p>
          </div>
          <div className="text-xs text-purple-300 flex items-center gap-1.5 font-medium">
            <ExternalLink className="w-3.5 h-3.5" />
            Listo para conectar en Vercel
          </div>
        </div>
      </div>

      {/* Step by step terminal instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Comandos Detallados para Correr en tu PC</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                1
              </span>
              <h4 className="text-sm font-semibold text-white">Clonar el repositorio y entrar en la carpeta:</h4>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 relative">
              <code>git clone https://github.com/Eduardo-Fu/Losaltosproto.git<br />cd Losaltosproto</code>
              <button
                onClick={() => copyCode('git clone https://github.com/Eduardo-Fu/Losaltosproto.git\ncd Losaltosproto', 'c1')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white p-1"
              >
                {copiedId === 'c1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                2
              </span>
              <h4 className="text-sm font-semibold text-white">Crear archivo .env y configurar conexión:</h4>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 relative">
              <pre className="overflow-x-auto">
{`cp .env.example .env

# Contenido recomendado en tu .env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/losaltos_db?schema=public"
JWT_SECRET="losaltos_super_secret_jwt_key_2026_securerandom"`}
              </pre>
              <button
                onClick={() => copyCode('DATABASE_URL="postgresql://postgres:postgres@localhost:5432/losaltos_db?schema=public"\nJWT_SECRET="losaltos_super_secret_jwt_key_2026_securerandom"', 'c2')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white p-1"
              >
                {copiedId === 'c2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                3
              </span>
              <h4 className="text-sm font-semibold text-white">Ejecutar migraciones y sembrar datos de prueba (Seed):</h4>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 relative">
              <code>npx prisma db push && npm run db:seed</code>
              <button
                onClick={() => copyCode('npx prisma db push && npm run db:seed', 'c3')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white p-1"
              >
                {copiedId === 'c3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                4
              </span>
              <h4 className="text-sm font-semibold text-white">Iniciar el servidor de Next.js:</h4>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 relative">
              <code>npm run dev</code>
              <button
                onClick={() => copyCode('npm run dev', 'c4')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white p-1"
              >
                {copiedId === 'c4' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Abre en tu navegador <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="text-blue-400 underline font-semibold">http://localhost:3000</a>
            </p>
          </div>
        </div>
      </div>

      {/* Default demo credentials card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Credenciales Incluidas en el Seed</h3>
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
