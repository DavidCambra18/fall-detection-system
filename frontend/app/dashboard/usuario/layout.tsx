'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsuarioLayout({ children }: { children: React.ReactNode }) {
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
      
      // NORMALIZACIÓN: Aceptamos roleId (CamelCase) o role_id (snake_case)
      const rId = user.roleId !== undefined ? user.roleId : user.role_id;

      // Permitimos al Admin (1), al Cuidador (2) y al Paciente (3)
      if (rId === 1 || rId === 2 || rId === 3) {
        setAuthorized(true);
      } else {
        console.warn("Acceso denegado a Usuario. Rol no reconocido:", rId);
        router.replace('/login');
      }
    } catch (e) {
      console.error("Error en UsuarioLayout:", e);
      router.replace('/login');
    }
  }, [router]);

  // Evitamos errores de hidratación y renderizado no autorizado
  if (!isMounted || !authorized) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}