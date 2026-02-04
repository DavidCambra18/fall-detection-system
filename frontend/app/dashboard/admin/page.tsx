'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Smartphone, 
  AlertCircle, 
  Activity, 
  ArrowUpRight,
  ShieldAlert,
  Zap
} from 'lucide-react';

import Link from 'next/link';
import TelemetryChart from '../../components/TelemetryChart';

export default function AdminDashboardPage() {
  // 1. Estado inicializado para evitar errores de undefined en el primer render
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalDispositivos: 0,
    alertasCriticas: 0,
    dispositivosOffline: 0
  });

  // 2. Datos de telemetría (Simulados para visualización inmediata)
  const [telemetryData, setTelemetryData] = useState([
    { timestamp: '20:00', acc_x: 0.05, acc_y: 1.01, acc_z: 0.02 },
    { timestamp: '20:05', acc_x: -0.02, acc_y: 0.98, acc_z: 0.05 },
    { timestamp: '20:10', acc_x: 0.15, acc_y: 1.25, acc_z: 0.20 },
    { timestamp: '20:15', acc_x: -0.05, acc_y: 0.95, acc_z: -0.01 },
    { timestamp: '20:20', acc_x: 0.02, acc_y: 1.00, acc_z: 0.03 },
  ]);

  // 3. Carga de datos reales
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simulación de carga (Sustituir por fetch real cuando el backend esté listo)
        // const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        // const data = await res.json();
        // setStats(data);

        setStats({
          totalUsuarios: 12,
          totalDispositivos: 8,
          alertasCriticas: 2,
          dispositivosOffline: 1
        });
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      }
    };

    loadDashboardData();
  }, []);

  const accesosRapidos = [
    { name: 'Gestionar Usuarios', href: '/dashboard/admin/users', icon: <Users size={20} />, color: 'bg-blue-500' },
    { name: 'Inventario Hardware', href: '/dashboard/admin/devices', icon: <Smartphone size={20} />, color: 'bg-purple-500' },
    { name: 'Historial Global', href: '/dashboard/history', icon: <Activity size={20} />, color: 'bg-slate-700' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Seccion */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">Panel de Control</h1>
          <p className="text-slate-500 text-sm font-medium">Gestión de infraestructura FallDetector en tiempo real</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Zap size={14} className="text-amber-500 fill-amber-500" />
          Status: Cloud Sync Active
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={24} />} value={stats.totalUsuarios} label="Usuarios" color="text-blue-600" />
        <StatCard icon={<Smartphone size={24} />} value={stats.totalDispositivos} label="Dispositivos" color="text-purple-600" />
        <StatCard icon={<ShieldAlert size={24} />} value={stats.alertasCriticas} label="Caídas Hoy" color="text-red-600" border="border-l-4 border-l-red-500" />
        <StatCard icon={<AlertCircle size={24} />} value={stats.dispositivosOffline} label="Fuera de Línea" color="text-amber-500" />
      </div>

      {/* Gráfica Principal de Telemetría */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 shadow-sm">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Monitorización de Acelerómetro</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Señal en vivo del sensor ESP32 (Ejes X, Y, Z)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter text-nowrap">Live Stream</span>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <TelemetryChart data={telemetryData} />
        </div>
      </div>

      {/* Grid de Accesos Directos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accesosRapidos.map((item) => (
          <Link key={item.href} href={item.href} className="block group">
            <div className="h-full bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group-hover:border-blue-500 group-hover:shadow-xl group-hover:shadow-blue-50/50 transition-all cursor-pointer relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 ${item.color} opacity-5 -mr-12 -mt-12 rounded-full transition-transform duration-500 group-hover:scale-150`} />
              <div className="flex justify-between items-start relative z-10">
                <div className={`${item.color} text-white p-3.5 rounded-2xl shadow-lg shadow-slate-100`}>
                  {item.icon}
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                  <ArrowUpRight size={18} />
                </div>
              </div>
              <h3 className="mt-6 font-bold text-slate-800 text-lg">{item.name}</h3>
              <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">Configuración y auditoría avanzada de {item.name.toLowerCase()}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Barra de Estado del Servidor */}
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-5 h-5 bg-green-500/30 rounded-full animate-ping" />
            <div className="w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 relative z-10" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">Servidor de Recepción IoT (Main Cluster)</p>
            <p className="text-[10px] text-slate-500 font-mono tracking-tighter opacity-80">
              Endpoint: /api/v1/telemetry | DB: PostgreSQL 16.2 | Avg Latency: 18ms
            </p>
          </div>
        </div>
        <button className="w-full md:w-auto text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-8 py-3.5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-95">
          Ver Consola de Logs
        </button>
      </div>
    </div>
  );
}

// Componente Interno: Tarjeta de Estadísticas
function StatCard({ icon, value, label, color, border = "" }: any) {
  return (
    <div className={`bg-white p-6 rounded-[1.8rem] border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group ${border}`}>
      <div className={`${color} mb-4 p-3.5 bg-slate-50 w-fit rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
    </div>
  );
}