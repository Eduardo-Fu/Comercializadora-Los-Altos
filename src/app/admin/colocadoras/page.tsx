'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserX,
  Search,
  Store,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  KeyRound,
  FileText,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Colocadora {
  id: string;
  nombre: string;
  dpi: string;
  fechaContratacion: string;
  estado: 'ACTIVA' | 'INACTIVA';
  motivoBaja: string | null;
  fechaBaja: string | null;
  user: {
    id: string;
    email: string;
    activo: boolean;
  };
  tiendasAsignadas: {
    tienda: {
      id: string;
      nombre: string;
      ciudad: string | null;
    };
  }[];
  _count: {
    inventarios: number;
    mermas: number;
    vencimientos: number;
  };
}

interface TiendaSimple {
  id: string;
  nombre: string;
  ciudad: string | null;
}

export default function AdminColocadorasPage() {
  const [colocadoras, setColocadoras] = useState<Colocadora[]>([]);
  const [tiendas, setTiendas] = useState<TiendaSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ACTIVA' | 'INACTIVA'>('ACTIVA');

  // Modals State
  const [showHireModal, setShowHireModal] = useState(false);
  const [showBajaModal, setShowBajaModal] = useState(false);
  const [selectedColocadora, setSelectedColocadora] = useState<Colocadora | null>(null);

  // Hire Form State
  const [nombre, setNombre] = useState('');
  const [dpi, setDpi] = useState('');
  const [fechaContratacion, setFechaContratacion] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTiendas, setSelectedTiendas] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Baja Form State
  const [motivoBaja, setMotivoBaja] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchColocadoras = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/colocadoras?search=${encodeURIComponent(search)}&estado=${activeTab}`
      );
      const data = await res.json();
      if (data.success) {
        setColocadoras(data.colocadoras);
      }
    } catch (err) {
      console.error('Error fetching colocadoras:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTiendas = async () => {
    try {
      const res = await fetch('/api/admin/tiendas');
      const data = await res.json();
      if (data.success) {
        setTiendas(data.tiendas.map((t: any) => ({ id: t.id, nombre: t.nombre, ciudad: t.ciudad })));
      }
    } catch (err) {
      console.error('Error fetching tiendas:', err);
    }
  };

  useEffect(() => {
    fetchTiendas();
  }, []);

  useEffect(() => {
    fetchColocadoras();
  }, [search, activeTab]);

  const toggleTiendaSelection = (tiendaId: string) => {
    if (selectedTiendas.includes(tiendaId)) {
      setSelectedTiendas(selectedTiendas.filter((id) => id !== tiendaId));
    } else {
      setSelectedTiendas([...selectedTiendas, tiendaId]);
    }
  };

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validación numérica estricta para DPI
    if (!/^\d+$/.test(dpi)) {
      setError('El Documento Personal de Identificación (DPI) debe contener solamente números.');
      setSubmitting(false);
      return;
    }

    if (selectedTiendas.length === 0) {
      setError('Debe asignar al menos una tienda o supermercado a la colocadora.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/colocadoras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          dpi,
          fechaContratacion,
          tiendasIds: selectedTiendas,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar contratación');
      }

      setSuccess(`Colocadora "${nombre}" contratada y registrada exitosamente.`);
      setShowHireModal(false);
      // Reset form
      setNombre('');
      setDpi('');
      setSelectedTiendas([]);
      setEmail('');
      setPassword('');
      fetchColocadoras();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBajaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColocadora) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/colocadoras/${selectedColocadora.id}/baja`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivoBaja,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la baja');
      }

      setSuccess(`La colaboradora "${selectedColocadora.nombre}" ha sido dada de baja.`);
      setShowBajaModal(false);
      setSelectedColocadora(null);
      setMotivoBaja('');
      fetchColocadoras();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openBajaModal = (col: Colocadora) => {
    setSelectedColocadora(col);
    setMotivoBaja('');
    setError(null);
    setShowBajaModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            Equipo de Colocadoras
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ingreso de nuevas contrataciones con DPI, asignación de tiendas y registro de bajas con motivo.
          </p>
        </div>

        <button
          onClick={() => setShowHireModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-xs transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          Nueva Contratación
        </button>
      </div>

      {/* Alertas */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs y Buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-200/70 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('ACTIVA')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ACTIVA'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Colocadoras Activas
          </button>
          <button
            onClick={() => setActiveTab('INACTIVA')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'INACTIVA'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Historial de Bajas
          </button>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:w-72">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o DPI..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabla de Colocadoras */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs">Cargando colocadoras...</span>
          </div>
        ) : colocadoras.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {activeTab === 'ACTIVA'
              ? 'No hay colocadoras activas registradas.'
              : 'No hay registros de colaboradoras dadas de baja.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Colaboradora</th>
                  <th className="py-3.5 px-4">DPI (Identificación)</th>
                  <th className="py-3.5 px-4">
                    {activeTab === 'ACTIVA' ? 'Tiendas Asignadas' : 'Fecha y Motivo de Baja'}
                  </th>
                  <th className="py-3.5 px-4">Fecha Contratación</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colocadoras.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            col.estado === 'ACTIVA'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {col.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{col.nombre}</div>
                          <div className="text-[11px] text-slate-400">{col.user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-700 font-mono text-xs">
                      <div className="inline-flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>{col.dpi}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {col.estado === 'ACTIVA' ? (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {col.tiendasAsignadas.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">Sin tiendas</span>
                          ) : (
                            col.tiendasAsignadas.map((item) => (
                              <span
                                key={item.tienda.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                              >
                                <Store className="w-2.5 h-2.5" />
                                {item.tienda.nombre}
                              </span>
                            ))
                          )}
                        </div>
                      ) : (
                        <div className="max-w-xs space-y-1">
                          <div className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Baja: {col.fechaBaja ? formatDate(col.fechaBaja) : 'N/D'}
                          </div>
                          <div className="text-xs text-slate-600 bg-red-50/70 p-2 rounded-lg border border-red-100 italic">
                            &quot;{col.motivoBaja || 'Sin motivo detallado'}&quot;
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-600 text-xs">
                      {formatDate(col.fechaContratacion)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      {col.estado === 'ACTIVA' ? (
                        <button
                          onClick={() => openBajaModal(col)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition active:scale-95"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Dar de Baja
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Inactiva
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nueva Contratación */}
      {showHireModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Ingreso de Nueva Contratación (Colocadora)
              </h2>
              <button
                onClick={() => setShowHireModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleHireSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Completo de la Colocadora *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="ej. María Elena Gómez"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DPI (Solamente números) *
                  </label>
                  <input
                    type="text"
                    required
                    value={dpi}
                    onChange={(e) => setDpi(e.target.value.replace(/\D/g, ''))}
                    placeholder="ej. 2987123450101"
                    maxLength={15}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Sin guiones ni espacios.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Contratación *
                </label>
                <input
                  type="date"
                  required
                  value={fechaContratacion}
                  onChange={(e) => setFechaContratacion(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Selección Múltiple de Tiendas Asignadas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Listado de Tiendas Asignadas (Supermercados) *
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Selecciona uno o más supermercados donde colocará productos.
                </p>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1.5 bg-slate-50/50">
                  {tiendas.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-2">
                      No hay supermercados registrados. Regístralos primero en Tiendas.
                    </div>
                  ) : (
                    tiendas.map((tienda) => {
                      const isSelected = selectedTiendas.includes(tienda.id);
                      return (
                        <label
                          key={tienda.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition text-xs ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTiendaSelection(tienda.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{tienda.nombre}</span>
                          {tienda.ciudad && (
                            <span className="text-[10px] text-slate-400 ml-auto font-normal">
                              ({tienda.ciudad})
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Credenciales de Acceso Web */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  Credenciales de Acceso Web para la Colocadora
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="maria@losaltos.com"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowHireModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Contratación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dar de Baja a una Colocadora */}
      {showBajaModal && selectedColocadora && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                Dar de Baja a una Colaboradora
              </h2>
              <button
                onClick={() => setShowBajaModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleBajaSubmit} className="mt-4 space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500">Colaboradora seleccionada:</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedColocadora.nombre}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  DPI: {selectedColocadora.dpi}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de la Baja * (Obligatorio)
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoBaja}
                  onChange={(e) => setMotivoBaja(e.target.value)}
                  placeholder="Escribe detalladamente el motivo de la baja (ej. Renuncia voluntaria, finalización de contrato, etc.)..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBajaModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !motivoBaja.trim()}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Baja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
