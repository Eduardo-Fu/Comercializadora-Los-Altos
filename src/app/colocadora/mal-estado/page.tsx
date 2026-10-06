'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Camera,
  Upload,
  ArrowLeft,
  Building2,
  Store,
  Package,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

interface Tienda {
  id: string;
  nombre: string;
  ciudad: string | null;
}

interface Producto {
  id: string;
  nombre: string;
  codigoU: string;
  empresaId: string;
}

interface Empresa {
  id: string;
  nombre: string;
  productos: Producto[];
}

export default function ColocadoraMalEstadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  // Form State
  const [selectedTiendaId, setSelectedTiendaId] = useState('');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('');
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadContext() {
      try {
        setLoading(true);
        const res = await fetch('/api/colocadora/context');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error cargando datos');

        setTiendas(data.tiendas);
        setEmpresas(data.empresas);

        if (data.tiendas.length > 0) setSelectedTiendaId(data.tiendas[0].id);
        if (data.empresas.length > 0) {
          setSelectedEmpresaId(data.empresas[0].id);
          if (data.empresas[0].productos.length > 0) {
            setSelectedProductoId(data.empresas[0].productos[0].id);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadContext();
  }, []);

  const currentEmpresa = empresas.find((e) => e.id === selectedEmpresaId);
  const currentProducts = currentEmpresa ? currentEmpresa.productos : [];

  useEffect(() => {
    if (currentProducts.length > 0) {
      setSelectedProductoId(currentProducts[0].id);
    } else {
      setSelectedProductoId('');
    }
  }, [selectedEmpresaId]);

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'mermas');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir la fotografía');

      setImagenUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!imagenUrl) {
      setError('Debes tomar o subir la fotografía de evidencia del producto dañado.');
      setSubmitting(false);
      return;
    }

    if (!descripcion.trim()) {
      setError('Debes ingresar una descripción manual de lo sucedido.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/colocadora/mal-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: selectedEmpresaId,
          tiendaId: selectedTiendaId,
          productoId: selectedProductoId,
          imagenUrl,
          descripcion,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar el reporte');

      setSuccess('Reporte de producto en mal estado enviado exitosamente.');
      setImagenUrl('');
      setDescripcion('');

      setTimeout(() => {
        router.push('/colocadora');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/colocadora"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Ingreso de Producto en Mal Estado
          </h1>
          <p className="text-xs text-slate-500">
            Reporta productos dañados con fotografía y descripción para control de mermas.
          </p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
          <span className="text-xs">Cargando formulario de mermas...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                Supermercado / Tienda *
              </label>
              <select
                required
                value={selectedTiendaId}
                onChange={(e) => setSelectedTiendaId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
              >
                {tiendas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Nombre de la Empresa *
              </label>
              <select
                required
                value={selectedEmpresaId}
                onChange={(e) => setSelectedEmpresaId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
              >
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              Producto Afectado *
            </label>
            <select
              required
              value={selectedProductoId}
              onChange={(e) => setSelectedProductoId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
            >
              {currentProducts.length === 0 ? (
                <option value="">No hay productos para esta empresa</option>
              ) : (
                currentProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.codigoU})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Fotografía Obligatoria */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Fotografía del Producto en Mal Estado *
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Toma una fotografía directa o sube la evidencia del daño.
            </p>

            <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-rose-200 hover:border-rose-500 rounded-2xl bg-rose-50/30 hover:bg-rose-50/60 transition group">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {uploadingImage ? 'Cargando fotografía...' : 'Tomar Foto o Seleccionar Archivo'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG o WebP</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>

            {imagenUrl && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <img
                  src={imagenUrl}
                  alt="Evidencia"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-2xs"
                />
                <div className="flex-1 truncate">
                  <div className="text-xs font-bold text-slate-800">Fotografía cargada</div>
                  <div className="text-[10px] text-slate-400 truncate">{imagenUrl}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setImagenUrl('')}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Cambiar foto
                </button>
              </div>
            )}
          </div>

          {/* Descripción Manual */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Descripción de lo Sucedido * (Ingresado por la colocadora)
            </label>
            <textarea
              required
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explica qué causó el daño (ej. Empaque roto durante transporte, producto aplastado en bodega, derrame de líquido, etc.)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Botón de Envío */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting || uploadingImage || !imagenUrl}
              className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando reporte...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Reporte de Mal Estado
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
