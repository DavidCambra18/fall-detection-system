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
      const user = userStr ? JSON.parse(userStr) : null;

      // Verificamos role_id (Admin = 1)
      if (!user || user.role_id !== 1) {
        router.replace('/dashboard'); // Usamos replace para no ensuciar el historial
      } else {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error("Error al verificar permisos de admin");
      router.replace('/login');
    }
  }, [router]);

  // Mientras se monta o si no es admin, no mostramos nada
  if (!isMounted || !isAdmin) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}