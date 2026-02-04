'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Obtenemos el usuario del almacenamiento local
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      router.replace('/login');
      return;
    }

    const user = JSON.parse(storedUser);

    // 2. Lógica de redirección basada en tu estructura de carpetas
    switch (user.role_id) {
      case 1: // Admin
        router.replace('/dashboard/admin');
        break;
      case 2: // Cuidador
        router.replace('/dashboard/cuidador');
        break;
      case 3: // Paciente / Usuario
        // Redirigimos a su dispositivo (si no hay ID, por defecto al 1)
        router.replace(`/dashboard/usuario/${user.device_id || '1'}`);
        break;
      default:
        router.replace('/login');
        break;
    }
  }, [router]);

  // Mientras decide a dónde ir, mostramos un spinner centrado
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Cargando tu panel...
        </p>
      </div>
    </div>
  );
}