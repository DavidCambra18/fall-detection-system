'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CuidadorLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // NORMALIZACIÓN: Aceptamos roleId o role_id
      const rId = Number(user.roleId || user.role_id);

      // Role 2 es Cuidador, Role 1 es Admin (que también puede supervisar)
      if (rId === 2 || rId === 1) {
        setAuthorized(true);
      } else {
        console.warn("Acceso denegado a Cuidador. Rol detectado:", rId);
        router.replace('/dashboard'); 
      }
    } catch (e) {
      console.error("Error en CuidadorLayout:", e);
      router.replace('/login');
    }
  }, [router]);

  // No renderizamos nada hasta que el componente esté montado y autorizado
  if (!isMounted || !authorized) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}