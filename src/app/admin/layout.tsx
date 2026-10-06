import React from 'react';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import { getCurrentUser } from '@/lib/auth';

export default async function AdminLayout({
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
        title="Panel de Administración General"
      />
      <div className="flex-1 flex">
        <AdminSidebar />
        <div className="flex-1 lg:pl-64 w-full overflow-x-hidden">
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
