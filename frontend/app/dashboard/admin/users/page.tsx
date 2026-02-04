'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Mail, Lock, User, Calendar, Shield, CheckCircle2, AlertCircle, Trash2, RefreshCcw } from 'lucide-react';

export default function AdminUsersPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    surnames: '',
    date_born: ''
  });
  
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // 1. Cargar usuarios reales desde el backend
  const fetchUsers = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      // Nota: Si aún no tienes esta ruta GET /api/auth/users, dará error 404
      const response = await fetch('http://localhost:3000/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Validación de contraseña (Coincide con validators.ts del backend)
  const isPasswordValid = (pass: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, msg: '' });

    if (!isPasswordValid(formData.password)) {
      setStatus({ type: 'error', msg: 'Contraseña débil: requiere 8 caracteres, mayúscula, minúscula y número.' });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Usuario guardado en PostgreSQL correctamente.' });
        setFormData({ email: '', password: '', name: '', surnames: '', date_born: '' });
        fetchUsers(); // Refrescar la tabla automáticamente
      } else {
        setStatus({ type: 'error', msg: data.message || 'Error en el registro.' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Error de conexión con el servidor.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic">Panel de Administración</h1>
        <p className="text-slate-500 text-sm font-medium">Control de acceso y registro de usuarios</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO DE REGISTRO */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus size={20} className="text-blue-600" />
            <h2 className="font-bold text-slate-800">Registrar Nuevo Usuario</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text" required placeholder="Nombre"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
              <input
                type="text" placeholder="Apellidos (Opcional)"
                value={formData.surnames} onChange={(e) => setFormData({...formData, surnames: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>

            <input
              type="email" required placeholder="Correo Electrónico"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="password" required placeholder="Contraseña Segura"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
              <input
                type="date" placeholder="Fecha Nacimiento"
                value={formData.date_born} onChange={(e) => setFormData({...formData, date_born: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>

            {status.msg && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-wider ${
                status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {status.msg}
              </div>
            )}

            <button
              type="submit" disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
            >
              {isLoading ? 'Procesando...' : 'Crear Cuenta en Base de Datos'}
            </button>
          </form>
        </div>

        {/* INFO CARD */}
        <div className="space-y-4">
          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-200">
            <Shield className="mb-4 text-blue-400" size={32} />
            <h3 className="font-bold text-sm mb-2 uppercase tracking-tight">Restricción de Backend</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              La función <code className="text-blue-300 font-mono">registerUser</code> asigna por defecto el <b>Rol 3 (Paciente)</b>. Para otros roles, modificar la DB manualmente.
            </p>
          </div>
        </div>
      </div>

      {/* TABLA DE USUARIOS EXISTENTES */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-slate-800 text-lg uppercase tracking-tight">Usuarios Registrados</h2>
          <button onClick={fetchUsers} className="text-slate-400 hover:text-blue-600 p-2 transition-colors">
            <RefreshCcw size={20} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Nombre Completo</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.length > 0 ? (
                usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{u.name} {u.surnames}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-md uppercase">
                        {u.roleId === 1 ? 'Admin' : u.roleId === 2 ? 'Cuidador' : 'Paciente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                    {isFetching ? 'Conectando con PostgreSQL...' : 'Sin usuarios para mostrar.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}