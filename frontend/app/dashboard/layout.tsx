'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    
    // Recuperamos el usuario del localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // 1. Verificación de sesión usando 'role_id'
    // Cambiado user.roleId por user.role_id para coincidir con tu DB
    if (!token || user.role_id === undefined) {
      setAuthorized(false);
      router.replace('/login');
      return;
    }

    // 2. Control de acceso por carpetas según los roles (Admin=1, Cuidador=2, Paciente=3)
    const isAdminPath = pathname.startsWith('/dashboard/admin');
    const isCuidadorPath = pathname.startsWith('/dashboard/cuidador');
    const isUsuarioPath = pathname.startsWith('/dashboard/usuario');

    // Bloqueo para Admin (Solo Role 1)
    if (isAdminPath && user.role_id !== 1) {
      router.replace('/dashboard');
      return;
    }

    // Bloqueo para Cuidador (Role 2 o Role 1 que también supervisa)
    if (isCuidadorPath && user.role_id !== 2 && user.role_id !== 1) {
      router.replace('/dashboard');
      return;
    }

    // Bloqueo para Usuario/Paciente (Role 3 o superior)
    if (isUsuarioPath && ![1, 2, 3].includes(user.role_id)) {
      router.replace('/dashboard');
      return;
    }

    setAuthorized(true);
  }, [router, pathname]);

  // Pantalla de carga profesional
  if (!isMounted || !authorized) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Verificando credenciales...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}