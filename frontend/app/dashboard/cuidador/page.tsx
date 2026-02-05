'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Smartphone, ChevronRight, Plus, RefreshCcw } from 'lucide-react';

export default function CuidadorDevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Función para obtener los pacientes desde el Backend
  const fetchMyPatients = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Importante: Asegúrate de tener un endpoint en el backend que devuelva
      // los dispositivos asociados al cuidador logueado.
      const response = await fetch('http://localhost:3000/api/auth/my-patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      }
    } catch (error) {
      console.error("Error cargando pacientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPatients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight italic">Mis Pacientes</h1>
          <p className="text-slate-500 text-sm font-medium">Supervisión de dispositivos vinculados</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchMyPatients}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100 font-bold text-xs uppercase tracking-widest">
            <Plus size={18} /> Vincular
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.length > 0 ? (
            devices.map((dev) => (
              <Link key={dev.id} href={`/dashboard/usuario/${dev.id}`}>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${dev.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Smartphone size={24} />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                      dev.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {dev.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{dev.alias}</h3>
                  <p className="text-xs text-slate-400 font-mono mb-4 uppercase tracking-tighter">MAC: {dev.mac || 'N/A'}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-xs font-bold text-slate-500 italic">Bat: {dev.battery || '-%'}</span>
                    <div className="flex items-center gap-1 text-blue-600 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver detalle <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center">
              <p className="text-slate-400 font-medium italic">No tienes pacientes vinculados todavía.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}