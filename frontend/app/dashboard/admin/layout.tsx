'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const userStr = localStorage.getItem('user');
    
    try {
      if (!userStr) {
        router.replace('/login');
        return;
      }

      const user = JSON.parse(userStr);

      // NORMALIZACIÓN CRÍTICA: Aceptamos roleId o role_id
      const rId = Number(user.roleId || user.role_id);

      // Verificamos si es Admin (Rol 1)
      if (rId !== 1) {
        console.warn("Acceso denegado: Se requiere rol de administrador. Rol detectado:", rId);
        router.replace('/dashboard'); 
      } else {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error("Error al verificar permisos de admin:", e);
      router.replace('/login');
    }
  }, [router]);

  // Mientras se monta o si no es admin, mostramos el spinner de carga
  if (!isMounted || !isAdmin) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}