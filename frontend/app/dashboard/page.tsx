'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.replace('/login');
      return;
    }

    const user = JSON.parse(userStr);
    
    // --- SINCRONIZACIÓN CON ROLE_ID ---
    // Admin = 1, Cuidador = 2, Paciente = 3
    if (user.role_id === 1) {
      router.replace('/dashboard/admin');
    } else if (user.role_id === 2) {
      router.replace('/dashboard/cuidador');
    } else if (user.role_id === 3) {
      // Si es paciente, lo mandamos a su dispositivo asignado o al '1' por defecto
      router.replace(`/dashboard/usuario/${user.device_id || '1'}`);
    } else {
      // Por si acaso hay un rol no definido
      router.replace('/login');
    }
  }, [router]);

  // Se muestra un estado de carga breve mientras se redirige
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Redirigiendo según tu rol...
        </p>
      </div>
    </div>
  );
}