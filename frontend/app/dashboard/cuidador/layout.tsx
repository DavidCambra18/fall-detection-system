'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CuidadorLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Role 2 es Cuidador, Role 1 es Admin (que también puede supervisar)
    if (user.role_id === 2 || user.role_id === 1) {
      setAuthorized(true);
    } else {
      router.push('/dashboard'); // Si es un paciente, lo mandamos a su sitio
    }
  }, [router]);

  if (!authorized) return null;

  return <>{children}</>;
}