'use client';

import { useState, useEffect } from 'react';
import { 
  Search, UserPlus, X, Save, Mail, Shield, 
  User as UserIcon, Activity, Smartphone, 
  Edit2, Trash2, ChevronDown, Lock, UserCircle 
} from 'lucide-react';

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Carga inicial de usuarios
  useEffect(() => {
    const fetchInitialUsers = async () => {
      try {
        const mockUsers = [
          { id: 1, name: 'Admin', surnames: 'Principal', email: 'admin@sistema.com', roleId: 1 },
          { id: 2, name: 'Juan', surnames: 'Pérez', email: 'juan.cuidador@email.com', roleId: 2 },
          { id: 3, name: 'María', surnames: 'García', email: 'maria.paciente@email.com', roleId: 3 },
        ];
        setUsers(mockUsers);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };
    fetchInitialUsers();
  }, []);

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este registro médico?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  const handleEdit = (user: any) => {
    alert(`Modo edición para: ${user.name}`);
  };

  const filteredUsers = users.filter(user => 
    `${user.name} ${user.surnames} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-500 font-medium">Administración de personal y pacientes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          <UserPlus size={18} />
          Nuevo Usuario
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Filtrar por nombre..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase w-20 text-center">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Información</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Rol</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-center text-xs font-medium text-slate-400">
                    {user.id.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm uppercase">
                        {user.name ? user.name[0] : 'U'}{user.surnames ? user.surnames[0] : ''}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-none">{user.name} {user.surnames}</p>
                        <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge roleId={user.roleId} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-blue-700 rounded-lg transition-all"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-all"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <AddUserModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={(newUser: any) => {
            // USAMOS UNA FUNCIÓN DE ACTUALIZACIÓN PARA ASEGURARNOS DE TENER EL ESTADO MÁS RECIENTE
            setUsers((prevUsers) => [...prevUsers, newUser]);
          }}
        />
      )}
    </div>
  );
}

function AddUserModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({ name: '', surnames: '', email: '', password: '', roleId: 3 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error en el registro');

      // IMPORTANTE: El objeto que enviamos a onSuccess debe tener la estructura de la tabla
      const userToAdd = {
        id: data.user?.id || Math.floor(Math.random() * 1000) + 10,
        name: formData.name,
        surnames: formData.surnames,
        email: formData.email,
        roleId: formData.roleId
      };

      onSuccess(userToAdd);
      alert("Registro completado con éxito.");
      onClose(); // Cerramos el modal después de todo
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Alta de Nuevo Usuario</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Nombre</label>
              <input required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-semibold" 
                onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Apellidos</label>
              <input required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-semibold" 
                onChange={e => setFormData({...formData, surnames: e.target.value})} value={formData.surnames} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Email Corporativo</label>
            <div className="relative text-slate-900">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="email" required className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold" 
                onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Contraseña Temporal</label>
            <div className="relative text-slate-900">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="password" required className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold" 
                onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Rol de Seguridad</label>
            <div className="relative text-slate-900">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select className="w-full pl-9 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold appearance-none cursor-pointer" 
                value={formData.roleId} onChange={e => setFormData({...formData, roleId: Number(e.target.value)})}>
                <option value={1}>Administrador</option>
                <option value={2}>Personal Médico</option>
                <option value={3}>Paciente</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg font-bold text-xs uppercase hover:bg-slate-50 transition-all">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase">
              {isSubmitting ? <Activity className="animate-spin" size={16} /> : <Save size={16} />}
              Finalizar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleBadge({ roleId }: { roleId: number }) {
  const roles: any = {
    1: { label: 'Administrador', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <Shield size={12} /> },
    2: { label: 'Personal Médico', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Activity size={12} /> },
    3: { label: 'Paciente', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <UserCircle size={12} /> }
  };
  const role = roles[roleId] || { label: 'Usuario', color: 'bg-slate-50 text-slate-500 border-slate-100', icon: null };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold ${role.color}`}>
      {role.icon} {role.label}
    </span>
  );
}