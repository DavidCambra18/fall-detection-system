'use client';

import { Smartphone, Plus, Settings, Cpu } from 'lucide-react';

export default function AdminDevicesManagement() {
  // Mocks basados en tu tabla SQL 'device'
  const dispositivos = [
    { id: 1, alias: 'Collar Abuelo', mac: 'AA:BB:CC:DD', status: 'active', device_id_logic: 'ESP-001' },
    { id: 2, alias: 'Pulsera María', mac: '11:22:33:44', status: 'low battery', device_id_logic: 'ESP-002' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Inventario Global</h1>
          <p className="text-slate-500 text-sm">Control de hardware (Tabla SQL: device)</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-bold text-sm">
          <Plus size={18} /> Registrar ESP32
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {dispositivos.map((d) => (
          <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${d.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <Cpu size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{d.alias}</h3>
                <p className="text-[10px] font-mono text-slate-400">LOGIC_ID: {d.device_id_logic} | MAC: {d.mac}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${
                d.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>{d.status}</span>
              <button className="text-slate-400 hover:text-blue-600"><Settings size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}