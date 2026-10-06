import React from 'react';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        userName={user?.name}
        userRole={user?.role}
        title="Portal Exclusivo de Clientes y Empresas"
      />
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
