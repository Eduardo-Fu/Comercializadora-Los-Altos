import React, { useState, useEffect } from 'react';
import { loadInitialState, saveState, AppState, User, Role } from './data/mockData';
import { Navbar } from './components/Navbar';
import { LoginView } from './views/LoginView';
import { AdminView } from './views/AdminView';
import { ColocadoraView } from './views/ColocadoraView';
import { EmpresaView } from './views/EmpresaView';
import { DeploymentGuideView } from './views/DeploymentGuideView';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<string>('main');

  useEffect(() => {
    saveState(state);
  }, [state]);

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
      handleLogin({
        id: 'usr_colocadora_1',
        email: 'colocadora@losaltos.com',
        name: 'María Gómez (Colocadora)',
        role: 'COLOCADORA',
        colocadoraId: 'coloc_1',
      });
    } else {
      handleLogin({
        id: 'usr_empresa_1',
        email: 'irex@comercializadoralosaltos.com',
        name: 'Representante Irex',
        role: 'EMPRESA',
        empresaId: 'emp_1',
      });
    }
  };

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('LOS_ALTOS_APP_STORAGE_V1');
      setState(loadInitialState());
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
      />

      <main className="flex-1">
        {activeTab === 'despliegue' ? (
          <DeploymentGuideView />
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
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Comercializadora Los Altos • Sistema de Control de Inventarios y Colocación en Supermercados
      </footer>
    </div>
  );
}
