'use client';

import { useEffect, useState } from 'react';
import { Filter, Download, AlertCircle, RefreshCcw } from 'lucide-react';

export default function GlobalHistoryPage() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Función para obtener datos reales del backend
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Ajusta este endpoint según la ruta que defina tu backend para los reportes
      const response = await fetch('http://localhost:3000/api/reports/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistorial(data);
      }
    } catch (error) {
      console.error("Error al cargar el historial:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight italic">Historial de Eventos</h1>
          <p className="text-slate-500 text-sm font-medium">Registros obtenidos de PostgreSQL en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchHistory}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            title="Refrescar datos"
          >
            <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition text-xs font-bold uppercase tracking-widest">
            <Filter size={16} /> Filtrar
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-100">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">Usuario / Dispositivo</th>
              <th className="px-6 py-4">Fecha (date_rep)</th>
              <th className="px-6 py-4 text-center">Impacto (X,Y,Z)</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {historial.length > 0 ? (
              historial.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{item.user_name || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.device_mac || item.device_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(item.date_rep).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs text-slate-600">
                    {item.acc_x?.toFixed(2)} | {item.acc_y?.toFixed(2)} | {item.acc_z?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {item.fall_detected ? (
                      <div className="flex items-center gap-1.5 text-red-600 font-black text-[9px] uppercase bg-red-50 px-2 py-1 rounded-md w-fit">
                        <AlertCircle size={14} /> Caída Detectada
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[9px] font-bold uppercase tracking-tighter">Normal</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">
                  {isLoading ? 'Conectando con el servidor...' : 'No se han encontrado registros en la base de datos.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}