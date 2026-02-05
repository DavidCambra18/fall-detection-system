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
    const userStr = localStorage.getItem('user');

    // 1. Verificación de existencia de datos
    if (!token || !userStr) {
      setAuthorized(false);
      router.replace('/login');
      return;
    }

    const user = JSON.parse(userStr);
    // NORMALIZACIÓN: Leemos el rol sin importar si es role_id o roleId
    const rId = user.role_id !== undefined ? user.role_id : user.roleId;

    // 2. Verificación de sesión
    if (rId === undefined) {
      console.error("Layout Error: No se encontró el ID de rol en el objeto usuario", user);
      setAuthorized(false);
      router.replace('/login');
      return;
    }

    // 3. Control de acceso por carpetas (Admin=1, Cuidador=2, Paciente=3)
    const isAdminPath = pathname.startsWith('/dashboard/admin');
    const isCuidadorPath = pathname.startsWith('/dashboard/cuidador');
    const isUsuarioPath = pathname.startsWith('/dashboard/usuario');

    // Bloqueo para Admin (Solo Role 1)
    if (isAdminPath && rId !== 1) {
      router.replace('/dashboard');
      return;
    }

    // Bloqueo para Cuidador (Role 2 o Role 1)
    if (isCuidadorPath && rId !== 2 && rId !== 1) {
      router.replace('/dashboard');
      return;
    }

    // Bloqueo para Usuario/Paciente (Cualquier rol válido)
    if (isUsuarioPath && ![1, 2, 3].includes(rId)) {
      router.replace('/dashboard');
      return;
    }

    setAuthorized(true);
  }, [router, pathname]);

  // Pantalla de carga profesional mientras verifica
  if (!isMounted || !authorized) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Sincronizando Dashboard...
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