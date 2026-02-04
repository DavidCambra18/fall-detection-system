'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsuarioLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    
    // Permitimos al Admin (1), al Cuidador (2) y al Paciente (3)
    if (user.role_id === 1 || user.role_id === 2 || user.role_id === 3) {
      setAuthorized(true);
    } else {
      // Si por algún error un usuario sin rol intenta entrar, al login
      router.replace('/login');
    }
  }, [router]);

  // Si no está autorizado, no renderizamos nada para evitar el parpadeo
  if (!authorized) return null;

  return <>{children}</>;
}