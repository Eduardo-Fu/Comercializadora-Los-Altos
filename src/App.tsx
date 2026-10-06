import React, { useState, useEffect, useCallback } from 'react';
import { loadInitialState, saveState, AppState, User, Role } from './data/mockData';
import { supabaseService, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { LoginView } from './views/LoginView';
import { AdminView } from './views/AdminView';
import { ColocadoraView } from './views/ColocadoraView';
import { EmpresaView } from './views/EmpresaView';
import { DeploymentGuideView } from './views/DeploymentGuideView';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<string>('main');
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(() => isSupabaseConfigured());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Synchronize state with Supabase tables
  const syncWithSupabase = useCallback(async (notify: boolean = false) => {
    if (!isSupabaseConfigured()) {
      setSupabaseConnected(false);
      if (notify) {
        setSyncToast({
          type: 'success',
          msg: 'Modo Local / Preview activo con persistencia en navegador.',
        });
        setTimeout(() => setSyncToast(null), 4000);
      }
      return;
    }
    try {
      setIsSyncing(true);
      const [tiendas, empresas, productos, colocadoras, inventarios, mermas] = await Promise.all([
        supabaseService.getTiendas().catch(() => []),
        supabaseService.getEmpresas().catch(() => []),
        supabaseService.getProductos().catch(() => []),
        supabaseService.getColocadoras().catch(() => []),
        supabaseService.getInventarios().catch(() => []),
        supabaseService.getMermas().catch(() => []),
      ]);

      setState((prev) => {
        // Map Tiendas
        const mappedTiendas = tiendas.length > 0
          ? tiendas.map((t) => {
              const existing = prev.tiendas.find((pt) => pt.id === t.id);
              return {
                id: t.id,
                nombre: t.nombre,
                ciudad: existing?.ciudad || 'Guatemala',
                direccion: existing?.direccion || 'Zona Central',
                activa: true,
              };
            })
          : prev.tiendas;

        // Map Empresas
        const mappedEmpresas = empresas.length > 0
          ? empresas.map((e) => {
              const existing = prev.empresas.find((pe) => pe.id === e.id);
              return {
                id: e.id,
                nombre: e.nombre,
                contacto: existing?.contacto || 'Departamento de Ventas',
                telefono: existing?.telefono || '5900-0136',
                email: existing?.email || `${e.nombre.toLowerCase().replace(/\s+/g, '')}@proveedor.com`,
                activa: true,
              };
            })
          : prev.empresas;

        // Map Productos
        const mappedProductos = productos.length > 0
          ? productos.map((p) => ({
              id: p.id,
              nombre: p.nombre,
              codigoU: p.codigo_u,
              codigoBarras: p.codigo_barras,
              empresaId: p.empresa_id,
              activo: true,
              imagenUrl: p.url_imagen || 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
            }))
          : prev.productos;

        // Map Colocadoras
        const mappedColocadoras = colocadoras.length > 0
          ? colocadoras.map((c) => {
              const existing = prev.colocadoras.find((pc) => pc.id === c.id);
              const assigned = c.tiendas_asignadas
                ? c.tiendas_asignadas.split(',').map((s) => s.trim())
                : [];
              return {
                id: c.id,
                nombre: c.nombre,
                dpi: c.dpi,
                fechaContratacion: c.fecha_contratacion,
                estado: (c.estado === 'INACTIVA' ? 'INACTIVA' : 'ACTIVA') as 'ACTIVA' | 'INACTIVA',
                tiendasAsignadas: assigned,
                email: existing?.email || `${c.nombre.toLowerCase().replace(/\s+/g, '')}@losaltos.com`,
                motivoBaja: c.motivo_baja,
              };
            })
          : prev.colocadoras;

        // Map Inventarios
        const mappedInventarios = inventarios.length > 0
          ? inventarios.map((inv) => {
              const prod = mappedProductos.find((p) => p.id === inv.producto_id);
              return {
                id: inv.id,
                fecha: inv.fecha_registro.split('T')[0],
                colocadoraId: inv.colocadora_id,
                tiendaId: inv.tienda_id,
                empresaId: prod?.empresaId || mappedEmpresas[0]?.id || '',
                detalles: [
                  {
                    productoId: inv.producto_id,
                    cantidadFisica: inv.cantidad,
                  },
                ],
              };
            })
          : prev.inventarios;

        // Map Mermas
        const mappedMermas = mermas.length > 0
          ? mermas.map((m) => {
              const prod = mappedProductos.find((p) => p.empresaId === m.empresa_id);
              return {
                id: m.id,
                fecha: m.fecha_reporte.split('T')[0],
                colocadoraId: mappedColocadoras[0]?.id || '',
                tiendaId: mappedTiendas[0]?.id || '',
                empresaId: m.empresa_id,
                productoId: prod?.id || mappedProductos[0]?.id || '',
                imagenUrl: m.url_fotografia || '',
                descripcion: m.descripcion,
              };
            })
          : prev.mermas;

        const nextState = {
          ...prev,
          tiendas: mappedTiendas,
          empresas: mappedEmpresas,
          productos: mappedProductos,
          colocadoras: mappedColocadoras,
          inventarios: mappedInventarios,
          mermas: mappedMermas,
        };

        saveState(nextState);
        return nextState;
      });

      setSupabaseConnected(true);
      if (notify) {
        setSyncToast({
          type: 'success',
          msg: `Sincronización exitosa con Supabase (${tiendas.length} tiendas, ${empresas.length} empresas, ${productos.length} productos)`,
        });
        setTimeout(() => setSyncToast(null), 4000);
      }
    } catch (error) {
      console.error('Error synchronizing with Supabase:', error);
      setSupabaseConnected(false);
      if (notify) {
        setSyncToast({
          type: 'error',
          msg: 'Error al contactar Supabase. Usando copia local.',
        });
        setTimeout(() => setSyncToast(null), 4000);
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync on startup
  useEffect(() => {
    syncWithSupabase(false);
  }, [syncWithSupabase]);

  const handleUpdateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const updated = updater(prev);
      saveState(updated);
      return updated;
    });
  };

  const handleLogin = (user: User) => {
    handleUpdateState((prev) => ({
      ...prev,
      currentUser: user,
    }));
    setActiveTab('main');
  };

  const handleLogout = () => {
    handleUpdateState((prev) => ({
      ...prev,
      currentUser: null,
    }));
  };

  const handleSelectRole = (role: Role) => {
    setActiveTab('main');
    if (role === 'ADMIN') {
      handleLogin({
        id: 'usr_admin',
        email: 'admin@losaltos.com',
        name: 'Rodrigo López (Administrador)',
        role: 'ADMIN',
      });
    } else if (role === 'COLOCADORA') {
      const c = state.colocadoras[0];
      handleLogin({
        id: c?.id || 'usr_colocadora_1',
        email: c?.email || 'colocadora@losaltos.com',
        name: c?.nombre ? `${c.nombre} (Colocadora)` : 'María Gómez (Colocadora)',
        role: 'COLOCADORA',
        colocadoraId: c?.id || 'coloc_1',
      });
    } else {
      const emp = state.empresas[0];
      handleLogin({
        id: 'usr_empresa_1',
        email: emp?.email || 'irex@comercializadoralosaltos.com',
        name: emp?.nombre ? `Representante ${emp.nombre}` : 'Representante Irex',
        role: 'EMPRESA',
        empresaId: emp?.id || 'emp_1',
      });
    }
  };

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('LOS_ALTOS_APP_STORAGE_V1');
      setState(loadInitialState());
      syncWithSupabase(true);
    }
  };

  // If no user is logged in, show Login view
  if (!state.currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar
        currentUser={state.currentUser}
        onSelectRole={handleSelectRole}
        onOpenDeploymentGuide={() =>
          setActiveTab((prev) => (prev === 'despliegue' ? 'main' : 'despliegue'))
        }
        onLogout={handleLogout}
        onResetData={handleResetData}
        activeTab={activeTab}
        supabaseConnected={supabaseConnected}
        isSyncing={isSyncing}
        onSyncSupabase={() => syncWithSupabase(true)}
      />

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm border backdrop-blur-md ${
              syncToast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/40 shadow-emerald-900/30'
                : 'bg-red-950/90 text-red-300 border-red-600/40 shadow-red-900/30'
            }`}
          >
            {syncToast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{syncToast.msg}</span>
          </div>
        </div>
      )}

      <main className="flex-1">
        {activeTab === 'despliegue' ? (
          <DeploymentGuideView onConfigChange={() => syncWithSupabase(true)} />
        ) : state.currentUser.role === 'ADMIN' ? (
          <AdminView state={state} onUpdateState={handleUpdateState} />
        ) : state.currentUser.role === 'COLOCADORA' ? (
          <ColocadoraView
            state={state}
            currentUser={state.currentUser}
            onUpdateState={handleUpdateState}
          />
        ) : (
          <EmpresaView state={state} currentUser={state.currentUser} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <span>Comercializadora Los Altos • Control de Inventarios y Colocación</span>
        <div className="flex items-center gap-2 mt-2 sm:mt-0 text-[11px] text-slate-400">
          <span
            className={`w-2 h-2 rounded-full inline-block ${
              supabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
            }`}
          />
          <span>
            {supabaseConnected ? 'Conectado a Supabase' : 'Modo Preview / Local'}
          </span>
        </div>
      </footer>
    </div>
  );
}
