import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Store,
  Package,
  ClipboardList,
  AlertOctagon,
  CalendarClock,
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Edit2,
  UserCheck,
  UserX,
  MapPin,
  Calendar,
  Image as ImageIcon,
  DollarSign,
  Barcode,
} from 'lucide-react';
import {
  AppState,
  Colocadora,
  Empresa,
  Tienda,
  Producto,
  InventarioRegistro,
  MermaRegistro,
  VencimientoRegistro,
  SugeridoRegistro,
} from '../data/mockData';

interface AdminViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

type AdminTab =
  | 'resumen'
  | 'colocadoras'
  | 'empresas'
  | 'tiendas'
  | 'productos'
  | 'inventarios'
  | 'mermas'
  | 'vencimientos'
  | 'sugeridos';

export const AdminView: React.FC<AdminViewProps> = ({ state, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('resumen');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showColocadoraModal, setShowColocadoraModal] = useState(false);
  const [showBajaModal, setShowBajaModal] = useState<string | null>(null);
  const [bajaMotivo, setBajaMotivo] = useState('');

  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [showTiendaModal, setShowTiendaModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [selectedInventario, setSelectedInventario] = useState<InventarioRegistro | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Form state for Colocadora
  const [newColocadora, setNewColocadora] = useState({
    nombre: '',
    dpi: '',
    fechaContratacion: new Date().toISOString().split('T')[0],
    email: '',
    tiendasAsignadas: [] as string[],
  });

  // Form state for Empresa
  const [newEmpresa, setNewEmpresa] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
  });

  // Form state for Tienda
  const [newTienda, setNewTienda] = useState({
    nombre: '',
    ciudad: 'Ciudad de Guatemala',
    direccion: '',
  });

  // Form state for Producto
  const [newProducto, setNewProducto] = useState({
    nombre: '',
    codigoU: '',
    codigoBarras: '',
    empresaId: state.empresas[0]?.id || '',
    imagenUrl: '',
  });

  // Handlers
  const handleCreateColocadora = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColocadora.nombre || !newColocadora.dpi) return;

    const id = `coloc_${Date.now()}`;
    const item: Colocadora = {
      id,
      nombre: newColocadora.nombre,
      dpi: newColocadora.dpi,
      fechaContratacion: newColocadora.fechaContratacion,
      estado: 'ACTIVA',
      tiendasAsignadas: newColocadora.tiendasAsignadas,
      email: newColocadora.email || `${newColocadora.dpi}@losaltos.com`,
    };

    onUpdateState((prev) => ({
      ...prev,
      colocadoras: [item, ...prev.colocadoras],
    }));

    setShowColocadoraModal(false);
    setNewColocadora({
      nombre: '',
      dpi: '',
      fechaContratacion: new Date().toISOString().split('T')[0],
      email: '',
      tiendasAsignadas: [],
    });
  };

  const handleBajaColocadora = (id: string) => {
    if (!bajaMotivo || bajaMotivo.trim().length < 5) {
      alert('Debes indicar un motivo de baja de al menos 5 caracteres.');
      return;
    }

    onUpdateState((prev) => ({
      ...prev,
      colocadoras: prev.colocadoras.map((c) =>
        c.id === id
          ? {
              ...c,
              estado: 'INACTIVA',
              motivoBaja: bajaMotivo,
              fechaBaja: new Date().toISOString().split('T')[0],
            }
          : c
      ),
    }));

    setShowBajaModal(null);
    setBajaMotivo('');
  };

  const handleCreateEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpresa.nombre) return;

    const item: Empresa = {
      id: `emp_${Date.now()}`,
      nombre: newEmpresa.nombre,
      contacto: newEmpresa.contacto,
      telefono: newEmpresa.telefono,
      email: newEmpresa.email,
      activa: true,
    };

    onUpdateState((prev) => ({
      ...prev,
      empresas: [item, ...prev.empresas],
    }));

    setShowEmpresaModal(false);
    setNewEmpresa({ nombre: '', contacto: '', telefono: '', email: '' });
  };

  const handleCreateTienda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTienda.nombre) return;

    const item: Tienda = {
      id: `td_${Date.now()}`,
      nombre: newTienda.nombre,
      ciudad: newTienda.ciudad,
      direccion: newTienda.direccion,
      activa: true,
    };

    onUpdateState((prev) => ({
      ...prev,
      tiendas: [item, ...prev.tiendas],
    }));

    setShowTiendaModal(false);
    setNewTienda({ nombre: '', ciudad: 'Ciudad de Guatemala', direccion: '' });
  };

  const handleCreateProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProducto.nombre || !newProducto.codigoU) return;

    const item: Producto = {
      id: `prod_${Date.now()}`,
      nombre: newProducto.nombre,
      codigoU: newProducto.codigoU,
      codigoBarras: newProducto.codigoBarras,
      empresaId: newProducto.empresaId,
      activo: true,
      imagenUrl:
        newProducto.imagenUrl ||
        'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
    };

    onUpdateState((prev) => ({
      ...prev,
      productos: [item, ...prev.productos],
    }));

    setShowProductoModal(false);
    setNewProducto({
      nombre: '',
      codigoU: '',
      codigoBarras: '',
      empresaId: state.empresas[0]?.id || '',
      imagenUrl: '',
    });
  };

  // Helper stats
  const activeColocadoras = state.colocadoras.filter((c) => c.estado === 'ACTIVA').length;
  const activeEmpresas = state.empresas.filter((e) => e.activa).length;
  const activeTiendas = state.tiendas.filter((t) => t.activa).length;
  const activeProductos = state.productos.filter((p) => p.activo).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'resumen'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Resumen
        </button>

        <button
          onClick={() => setActiveTab('colocadoras')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'colocadoras'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          Colocadoras ({state.colocadoras.length})
        </button>

        <button
          onClick={() => setActiveTab('empresas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'empresas'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Empresas ({state.empresas.length})
        </button>

        <button
          onClick={() => setActiveTab('tiendas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'tiendas'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Store className="w-4 h-4" />
          Supermercados ({state.tiendas.length})
        </button>

        <button
          onClick={() => setActiveTab('productos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'productos'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          Catálogo ({state.productos.length})
        </button>

        <button
          onClick={() => setActiveTab('inventarios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'inventarios'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Inventarios ({state.inventarios.length})
        </button>

        <button
          onClick={() => setActiveTab('mermas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'mermas'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Mermas ({state.mermas.length})
        </button>

        <button
          onClick={() => setActiveTab('vencimientos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'vencimientos'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          Vencimientos ({state.vencimientos.length})
        </button>

        <button
          onClick={() => setActiveTab('sugeridos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'sugeridos'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Sugeridos ({state.sugeridos.length})
        </button>
      </div>

      {/* TAB 1: RESUMEN GENERAL */}
      {activeTab === 'resumen' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs">Colocadoras</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{activeColocadoras}</div>
              <div className="text-[10px] text-slate-400 mt-1">Activas en tiendas</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs">Supermercados</span>
                <Store className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{activeTiendas}</div>
              <div className="text-[10px] text-slate-400 mt-1">Puntos de venta</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs">Empresas</span>
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{activeEmpresas}</div>
              <div className="text-[10px] text-slate-400 mt-1">Marcas aliadas</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs">Productos</span>
                <Package className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{activeProductos}</div>
              <div className="text-[10px] text-slate-400 mt-1">Catálogo activo</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs">Inventarios</span>
                <ClipboardList className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{state.inventarios.length}</div>
              <div className="text-[10px] text-slate-400 mt-1">Tomas registradas</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs">Mermas</span>
                <AlertOctagon className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">{state.mermas.length}</div>
              <div className="text-[10px] text-slate-400 mt-1">Con evidencia fotográfica</div>
            </div>
          </div>

          {/* Quick Actions & Recent Inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('colocadoras');
                    setShowColocadoraModal(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left transition"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-white">Contratar Nueva Colocadora</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('productos');
                    setShowProductoModal(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left transition"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium text-white">Agregar Producto al Catálogo</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('tiendas');
                    setShowTiendaModal(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left transition"
                >
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-white">Registrar Supermercado</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Recent Inventories List */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                  Últimos Registros de Inventario en Campo
                </h3>
                <button
                  onClick={() => setActiveTab('inventarios')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Ver todos →
                </button>
              </div>

              <div className="space-y-3">
                {state.inventarios.slice(0, 3).map((inv) => {
                  const coloc = state.colocadoras.find((c) => c.id === inv.colocadoraId);
                  const tienda = state.tiendas.find((t) => t.id === inv.tiendaId);
                  const totalUnits = inv.detalles.reduce((acc, d) => acc + d.cantidadFisica, 0);

                  return (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInventario(inv)}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{tienda?.nombre || 'Supermercado'}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                            {inv.fecha}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Registrado por: <strong className="text-slate-300">{coloc?.nombre || 'Colocadora'}</strong> • {inv.detalles.length} productos contabilizados
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-400">{totalUnits} un.</div>
                        <div className="text-[10px] text-slate-500">Total físico</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLOCADORAS */}
      {activeTab === 'colocadoras' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Equipo de Colocadoras</h2>
              <p className="text-xs text-slate-400">Gestión de personal de campo, DPI, contratos y asignación de supermercados</p>
            </div>
            <button
              onClick={() => setShowColocadoraModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              Contratar Colocadora
            </button>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Colaboradora</th>
                    <th className="py-3 px-4">DPI</th>
                    <th className="py-3 px-4">Fecha Contrato</th>
                    <th className="py-3 px-4">Supermercados Asignados</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {state.colocadoras.map((c) => {
                    const assignedStores = state.tiendas.filter((t) => c.tiendasAsignadas.includes(t.id));

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{c.nombre}</div>
                          <div className="text-[11px] text-slate-400">{c.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">{c.dpi}</td>
                        <td className="py-3.5 px-4 text-slate-300">{c.fechaContratacion}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {assignedStores.map((t) => (
                              <span
                                key={t.id}
                                className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-700"
                              >
                                {t.nombre}
                              </span>
                            ))}
                            {assignedStores.length === 0 && (
                              <span className="text-slate-500 italic">Sin tiendas asignadas</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {c.estado === 'ACTIVA' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              ACTIVA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                              <XCircle className="w-3 h-3" />
                              INACTIVA (Baja)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {c.estado === 'ACTIVA' ? (
                            <button
                              onClick={() => setShowBajaModal(c.id)}
                              className="px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition"
                            >
                              Dar de Baja
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500" title={c.motivoBaja || ''}>
                              Baja: {c.fechaBaja}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMPRESAS */}
      {activeTab === 'empresas' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Empresas Proveedoras / Marcas</h2>
              <p className="text-xs text-slate-400">Marcas clientes como Irex de Guatemala y Comercializadora Los Altos</p>
            </div>
            <button
              onClick={() => setShowEmpresaModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              Nueva Empresa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.empresas.map((emp) => {
              const prodCount = state.productos.filter((p) => p.empresaId === emp.id).length;

              return (
                <div key={emp.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{emp.nombre}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Contacto: {emp.contacto}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Activa
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">Teléfono:</span>
                      <span className="text-slate-300 font-mono">{emp.telefono}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Correo:</span>
                      <span className="text-slate-300">{emp.email}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{prodCount} productos registrados en catálogo</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SUPERMERCADOS / TIENDAS */}
      {activeTab === 'tiendas' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Supermercados y Puntos de Venta</h2>
              <p className="text-xs text-slate-400">Cadenas independientes en Guatemala: Gran Gallo, Más y Más, Espiga de Oro, etc.</p>
            </div>
            <button
              onClick={() => setShowTiendaModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              Nueva Tienda
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {state.tiendas.map((t) => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Store className="w-4 h-4" />
                    <span className="text-xs font-semibold">{t.ciudad}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{t.nombre}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
                    {t.direccion}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400">Punto Activo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CATÁLOGO PRODUCTOS */}
      {activeTab === 'productos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Catálogo de Productos</h2>
              <p className="text-xs text-slate-400">SKUs con Código U de supermercado y Código de Barras EAN</p>
            </div>
            <button
              onClick={() => setShowProductoModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {state.productos.map((p) => {
              const empresa = state.empresas.find((e) => e.id === p.empresaId);

              return (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    {p.imagenUrl && (
                      <div className="h-40 bg-slate-950 overflow-hidden relative">
                        <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] font-mono text-white">
                          {p.codigoU}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                        {empresa?.nombre || 'Marca'}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-1 leading-snug">{p.nombre}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-2">
                        <Barcode className="w-3.5 h-3.5 text-slate-500" />
                        {p.codigoBarras}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: INVENTARIOS REGISTRADOS */}
      {activeTab === 'inventarios' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Tomas Físicas de Inventario</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Supermercado</th>
                  <th className="py-3 px-4">Colocadora</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Unidades Contadas</th>
                  <th className="py-3 px-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {state.inventarios.map((inv) => {
                  const tienda = state.tiendas.find((t) => t.id === inv.tiendaId);
                  const coloc = state.colocadoras.find((c) => c.id === inv.colocadoraId);
                  const emp = state.empresas.find((e) => e.id === inv.empresaId);
                  const total = inv.detalles.reduce((a, b) => a + b.cantidadFisica, 0);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono text-slate-300">{inv.fecha}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{tienda?.nombre}</td>
                      <td className="py-3.5 px-4 text-slate-300">{coloc?.nombre}</td>
                      <td className="py-3.5 px-4 text-slate-300">{emp?.nombre}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{total} unidades</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInventario(inv)}
                          className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold"
                        >
                          Ver Desglose
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: MERMAS / MAL ESTADO */}
      {activeTab === 'mermas' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Mermas y Productos en Mal Estado</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {state.mermas.map((m) => {
              const tienda = state.tiendas.find((t) => t.id === m.tiendaId);
              const prod = state.productos.find((p) => p.id === m.productoId);

              return (
                <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div
                      className="h-44 bg-slate-950 cursor-pointer overflow-hidden relative group"
                      onClick={() => setSelectedPhoto(m.imagenUrl)}
                    >
                      <img src={m.imagenUrl} alt="Evidencia de daño" className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-semibold">
                        Ver Fotografía
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-400">{tienda?.nombre}</span>
                        <span className="text-slate-400 font-mono">{m.fecha}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{prod?.nombre}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        "{m.descripcion}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 8: VENCIMIENTOS */}
      {activeTab === 'vencimientos' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Alertas de Vencimiento de Lotes</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Supermercado</th>
                  <th className="py-3 px-4">Cantidad</th>
                  <th className="py-3 px-4">Fecha Vencimiento</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {state.vencimientos.map((v) => {
                  const prod = state.productos.find((p) => p.id === v.productoId);
                  const tienda = state.tiendas.find((t) => t.id === v.tiendaId);

                  const diffDays = Math.ceil(
                    (new Date(v.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                  );

                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-semibold text-white">{prod?.nombre}</td>
                      <td className="py-3.5 px-4 text-slate-300">{tienda?.nombre}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{v.cantidad} unidades</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{v.fechaVencimiento}</td>
                      <td className="py-3.5 px-4">
                        {diffDays < 0 ? (
                          <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 font-semibold border border-red-500/20">
                            VENCIDO
                          </span>
                        ) : diffDays <= 30 ? (
                          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                            POR VENCER ({diffDays} días)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                            VIGENTE ({diffDays} días)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: SUGERIDOS */}
      {activeTab === 'sugeridos' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Historial de Pedidos Sugeridos</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Supermercado</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Cantidad Sugerida</th>
                  <th className="py-3 px-4">Observaciones del Algoritmo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {state.sugeridos.map((s) => {
                  const prod = state.productos.find((p) => p.id === s.productoId);
                  const tienda = state.tiendas.find((t) => t.id === s.tiendaId);

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono text-slate-300">{s.fecha}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{tienda?.nombre}</td>
                      <td className="py-3.5 px-4 text-slate-300">{prod?.nombre}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">+{s.cantidadSugerida} un.</td>
                      <td className="py-3.5 px-4 text-slate-400 italic">{s.notas || 'Rotación regular'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Contratar Colocadora */}
      {showColocadoraModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Contratar Nueva Colocadora</h3>
            <form onSubmit={handleCreateColocadora} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newColocadora.nombre}
                  onChange={(e) => setNewColocadora({ ...newColocadora, nombre: e.target.value })}
                  placeholder="Ej. Ana Lucía Morales"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">DPI (Solo números)</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]+"
                    value={newColocadora.dpi}
                    onChange={(e) => setNewColocadora({ ...newColocadora, dpi: e.target.value })}
                    placeholder="2987123450101"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fecha Contratación</label>
                  <input
                    type="date"
                    required
                    value={newColocadora.fechaContratacion}
                    onChange={(e) => setNewColocadora({ ...newColocadora, fechaContratacion: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Supermercados Asignados</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {state.tiendas.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={newColocadora.tiendasAsignadas.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewColocadora({
                              ...newColocadora,
                              tiendasAsignadas: [...newColocadora.tiendasAsignadas, t.id],
                            });
                          } else {
                            setNewColocadora({
                              ...newColocadora,
                              tiendasAsignadas: newColocadora.tiendasAsignadas.filter((id) => id !== t.id),
                            });
                          }
                        }}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span className="truncate">{t.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowColocadoraModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Guardar Contratación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Dar de Baja */}
      {showBajaModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-red-400 mb-2">Dar de Baja a Colaboradora</h3>
            <p className="text-xs text-slate-300 mb-4">
              Por requerimiento de auditoría, debes ingresar un motivo detallado (mínimo 5 caracteres) para procesar la baja.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Motivo Obligatorio</label>
                <textarea
                  rows={3}
                  value={bajaMotivo}
                  onChange={(e) => setBajaMotivo(e.target.value)}
                  placeholder="Ej. Renuncia voluntaria por cambio de residencia."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBajaModal(null);
                    setBajaMotivo('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleBajaColocadora(showBajaModal)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-500 text-white"
                >
                  Confirmar Baja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Detalle de Inventario */}
      {selectedInventario && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Desglose Físico de Inventario</h3>
              <button
                onClick={() => setSelectedInventario(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-2">
              {selectedInventario.detalles.map((d) => {
                const prod = state.productos.find((p) => p.id === d.productoId);

                return (
                  <div
                    key={d.productoId}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{prod?.nombre}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Código U: {prod?.codigoU}</div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">{d.cantidadFisica} un.</div>
                  </div>
                );
              })}
            </div>

            {selectedInventario.observaciones && (
              <p className="text-xs text-slate-400 italic bg-slate-950/60 p-3 rounded-xl">
                Nota: "{selectedInventario.observaciones}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Foto de Merma */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <img src={selectedPhoto} alt="Evidencia ampliada" className="max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};
