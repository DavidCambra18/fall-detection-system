'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  History, 
  LogOut, 
  Bell, 
  Users, 
  ShieldCheck, 
  User as UserIcon 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getMenuItems = () => {
    // CAMBIO: El backend usa camelCase para roleId
    const role = user?.roleId; 
    
    if (role === 1) {
      return [
        { name: 'Inicio Admin', href: '/dashboard/admin', icon: <ShieldCheck size={20} /> },
        { name: 'Gestión Usuarios', href: '/dashboard/admin/users', icon: <Users size={20} /> },
        { name: 'Inventario Dispositivos', href: '/dashboard/admin/devices', icon: <Smartphone size={20} /> },
        { name: 'Historial Global', href: '/dashboard/history', icon: <History size={20} /> },
      ];
    }

    if (role === 2) {
      return [
        { name: 'Mis Pacientes', href: '/dashboard/cuidador', icon: <LayoutDashboard size={20} /> },
        { name: 'Historial Reciente', href: '/dashboard/history', icon: <History size={20} /> },
      ];
    }

    return [
      { 
        name: 'Mi Estado', 
        href: `/dashboard/usuario/${user?.device_id || '1'}`, 
        icon: <Smartphone size={20} /> 
      },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-lg shadow-blue-200">
          <Bell size={20} />
        </div>
        <span className="font-bold text-slate-800 text-lg tracking-tight">FallDetector</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest italic">
          {/* CAMBIO: Actualizado a roleId */}
          Menú de {user?.roleId === 1 ? 'Admin' : user?.roleId === 2 ? 'Cuidador' : 'Paciente'}
        </p>
        
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === item.href 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
            }`}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-3 py-4 mb-3 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
            <UserIcon size={20} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-slate-800 truncate">
              {user?.name || 'Usuario'} {user?.surnames || ''}
            </span>
            <span className="text-[9px] font-black text-blue-500 uppercase">
              {/* CAMBIO: Actualizado a roleId */}
              {user?.roleId === 1 ? 'Administrator' : user?.roleId === 2 ? 'Cuidador' : 'Paciente'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-xs uppercase tracking-wider">Salir</span>
        </button>
      </div>
    </aside>
  );
}