'use client';

import { 
  Users, 
  Smartphone, 
  AlertCircle, 
  Activity, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // Datos simulados que representan conteos de tus tablas SQL
  const stats = {
    totalUsuarios: 12,
    totalDispositivos: 8,
    alertasCriticas: 2,
    dispositivosOffline: 1
  };

  const accesosRapidos = [
    { name: 'Gestionar Usuarios', href: '/dashboard/admin/users', icon: <Users size={20} />, color: 'bg-blue-500' },
    { name: 'Inventario Hardware', href: '/dashboard/admin/devices', icon: <Smartphone size={20} />, color: 'bg-purple-500' },
    { name: 'Historial Global', href: '/dashboard/history', icon: <Activity size={20} />, color: 'bg-slate-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Panel de Administración</h1>
        <p className="text-slate-500 text-sm">Resumen general de la infraestructura FallDetector</p>
      </div>

      {/* Grid de Estadísticas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-blue-600 mb-3"><Users size={24} /></div>
          <p className="text-2xl font-black text-slate-800">{stats.totalUsuarios}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuarios Totales</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-purple-600 mb-3"><Smartphone size={24} /></div>
          <p className="text-2xl font-black text-slate-800">{stats.totalDispositivos}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispositivos Reg.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <div className="text-red-600 mb-3"><ShieldAlert size={24} /></div>
          <p className="text-2xl font-black text-slate-800">{stats.alertasCriticas}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Caídas hoy</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-amber-500 mb-3"><AlertCircle size={24} /></div>
          <p className="text-2xl font-black text-slate-800">{stats.dispositivosOffline}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Offline / Low Bat</p>
        </div>
      </div>

      {/* Accesos Directos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accesosRapidos.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-16 h-16 ${item.color} opacity-5 -mr-8 -mt-8 rounded-full`} />
              <div className="flex justify-between items-start">
                <div className={`${item.color} text-white p-3 rounded-xl shadow-lg`}>
                  {item.icon}
                </div>
                <ArrowUpRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
              </div>
              <h3 className="mt-4 font-bold text-slate-800">{item.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Acceder a la configuración avanzada</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerta Informativa (System Health) */}
      <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-green-500 w-3 h-3 rounded-full animate-ping" />
          <div>
            <p className="font-bold">Servidor de Recepción IoT</p>
            <p className="text-xs text-slate-400 font-mono">Status: Connected | API: v1.0.4</p>
          </div>
        </div>
        <button className="text-xs font-black uppercase tracking-widest border border-slate-600 px-4 py-2 rounded-lg hover:bg-slate-700 transition">
          Logs del Sistema
        </button>
      </div>
    </div>
  );
}