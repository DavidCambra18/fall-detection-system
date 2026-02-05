'use client';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Smartphone, AlertTriangle, Battery, Zap, History, ArrowLeft, CheckCircle, RefreshCcw } from 'lucide-react';

export default function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const deviceId = resolvedParams.id;

  const [dispositivo, setDispositivo] = useState<any>(null);
  const [reportes, setReportes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 1. Cargar datos del dispositivo y sus reportes
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/devices/${deviceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDispositivo(data.device);
        setReportes(data.reports);
      }
    } catch (error) {
      console.error("Error al obtener detalles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    fetchData();
  }, [fetchData]);

  // 2. Función para CONFIRMAR ALERTA (Falsa alarma o Atendida)
  const handleConfirmAlert = async (reportId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/reports/${reportId}/confirm`, {
        method: 'PATCH', // Usamos PATCH para actualización parcial
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ attended_by: user.id })
      });

      if (response.ok) {
        // Refrescamos los datos para ver el cambio de estado
        fetchData();
      }
    } catch (error) {
      alert("No se pudo confirmar la alerta.");
    }
  };

  if (isLoading || !dispositivo) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <RefreshCcw className="animate-spin" size={32} />
        <p className="text-xs font-black uppercase tracking-widest">Sincronizando con PostgreSQL...</p>
      </div>
    );
  }

  const ultimaAlerta = reportes.find(r => r.fall_detected);

  return (
    <div className="space-y-6">
      <Link href={user?.roleId === 1 ? "/dashboard/admin" : "/dashboard/cuidador"} 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-bold w-fit mb-2">
        <ArrowLeft size={16} /> Volver al Panel
      </Link>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">Estado: {dispositivo.alias}</h1>
          <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">MAC: {dispositivo.mac}</p>
        </div>
        
        {/* BOTÓN DE ACCIÓN PARA EL CUIDADOR */}
        {ultimaAlerta && (
          <button 
            onClick={() => handleConfirmAlert(ultimaAlerta.id)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 transition-all active:scale-95"
          >
            <CheckCircle size={18} /> Marcar como Atendido
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <Battery size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Batería</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{dispositivo.battery}%</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <Zap size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Actividad</span>
          </div>
          <p className="text-3xl font-black text-slate-800">
            {reportes[0]?.fall_detected ? 'IMPACTO' : 'ESTABLE'}
          </p>
        </div>

        <div className={`p-6 rounded-3xl border shadow-2xl transition-all ${reportes[0]?.fall_detected ? 'bg-red-600 border-red-700 text-white animate-pulse' : 'bg-white border-slate-200'}`}>
          <div className={`flex items-center gap-3 mb-2 ${reportes[0]?.fall_detected ? 'text-white' : 'text-slate-400'}`}>
            <AlertTriangle size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest text-inherit">Seguridad</span>
          </div>
          <p className="text-2xl font-black uppercase tracking-tight">
            {reportes[0]?.fall_detected ? 'CAÍDA DETECTADA' : 'SIN NOVEDAD'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-black text-slate-700 flex items-center gap-2 text-[10px] uppercase tracking-widest">
            <History size={16} className="text-slate-400" /> Registro de Actividad (Log)
          </h2>
          <button onClick={fetchData} className="text-slate-400 hover:text-blue-600 transition-colors">
            <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[9px] uppercase font-black text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-center">G-Force (X,Y,Z)</th>
                <th className="px-6 py-4 text-right">Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportes.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                    {new Date(report.date_rep).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-[11px] text-slate-500 font-medium">
                    {report.acc_x.toFixed(2)} | {report.acc_y.toFixed(2)} | {report.acc_z.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {report.fall_detected ? (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Crisis</span>
                    ) : (
                      <span className="text-slate-300 text-[9px] font-bold uppercase tracking-tighter italic">Dato Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}