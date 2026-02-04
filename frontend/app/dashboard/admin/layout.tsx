'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Si no hay usuario o no es Admin (role_id: 1), lo echamos
    if (!user || user.role_id !== 1) {
      router.push('/dashboard');
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  if (!isAdmin) return null; // No renderiza nada hasta confirmar que es admin

  return <>{children}</>;
}