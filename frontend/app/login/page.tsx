'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // Validaciones basadas en tus validators.ts del backend
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  const isFormValid = isEmailValid && isPasswordValid;

  // Redirección usando 'roleId' como lo envía auth.service.ts
  const redirectByUserRole = (user: any) => {
    const roleId = user.roleId || user.role_id; // Compatibilidad con ambos formatos

    if (roleId === 1) {
      router.push('/dashboard/admin');
    } else if (roleId === 2) {
      router.push('/dashboard/cuidador');
    } else if (roleId === 3) {
      // El backend no envía device_id por ahora, usamos '1' por defecto
      router.push(`/dashboard/usuario/${user.device_id || '1'}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    // Ajuste según tu app.ts (puerto 3000 y prefijo /api/auth)
    const API_URL = 'http://localhost:3000'; 

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardamos token y usuario (que contiene id, email, roleId)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Login real exitoso');
        redirectByUserRole(data.user);
      } else {
        setErrorMsg(data.message || 'Credenciales incorrectas.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Servidor offline, activando modo simulación...');
      
      // Bloque de simulación adaptado a 'roleId'
      let simulatedUser = null;

      if (email === 'admin@test.com' && password === 'Pass1234') {
        simulatedUser = { name: 'Admin', roleId: 1 };
      } else if (email === 'cuidador@test.com' && password === 'Pass1234') {
        simulatedUser = { name: 'Carlos', roleId: 2 };
      } else if (email === 'usuario@test.com' && password === 'Pass1234') {
        simulatedUser = { name: 'Juan', roleId: 3, device_id: '1' };
      }

      if (simulatedUser) {
        setTimeout(() => {
          localStorage.setItem('token', 'simulated-jwt-token');
          localStorage.setItem('user', JSON.stringify(simulatedUser));
          redirectByUserRole(simulatedUser);
        }, 800);
      } else {
        setErrorMsg('Error de conexión o contraseña no cumple requisitos (Mayús, Min, Núm, 8 carac).');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200 rotate-3">
            <span className="text-white text-3xl font-bold">📡</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">FallDetector</h1>
          <p className="text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest">Panel de Control</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-black uppercase tracking-wider animate-shake">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Corporativo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white focus:outline-none text-slate-900 transition-all font-medium"
              placeholder="nombre@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white focus:outline-none text-slate-900 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl ${
              !isFormValid || isLoading 
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 active:scale-95'
            }`}
          >
            {isLoading ? 'Verificando...' : 'Acceder ahora'}
          </button>
        </form>

        <div className="mt-10 p-5 bg-slate-900 rounded-2xl shadow-inner border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sandbox Mode (Requiere Pass: Pass1234)</p>
          </div>
          <div className="space-y-2 text-[11px] text-slate-400 font-mono">
            <p>🔹 <span className="text-blue-400">Admin:</span> admin@test.com</p>
            <p>🔹 <span className="text-blue-400">Cuidador:</span> cuidador@test.com</p>
            <p>🔹 <span className="text-blue-400">Paciente:</span> usuario@test.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}