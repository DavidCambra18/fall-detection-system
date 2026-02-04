'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  const isFormValid = isEmailValid && isPasswordValid;

  const redirectByUserRole = (user: any) => {
    // Usamos role_id para total consistencia con la base de datos
    const roleId = user.role_id; 
    
    if (roleId === 1) router.push('/dashboard/admin');
    else if (roleId === 2) router.push('/dashboard/cuidador');
    else if (roleId === 3) router.push(`/dashboard/usuario/${user.device_id || '1'}`);
    else router.push('/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // CAMBIO CLAVE: Usamos ruta relativa '/api' para que pase por el proxy de Next.js
      // Esto elimina el error de CORS automáticamente.
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('✅ Acceso real concedido');
        redirectByUserRole(data.user);
      } else {
        console.error('Detalles del error:', data);
        
        let cleanedMessage = data.message || 'Error en la petición (400)';
        
        // Manejo de errores de conexión y codificación
        if (cleanedMessage.toLowerCase().includes('autenticaci') || cleanedMessage.toLowerCase().includes('password')) {
            cleanedMessage = "ERROR: El servidor no puede conectar con PostgreSQL. Revisa el .env";
        } else {
            cleanedMessage = cleanedMessage.replace(/[^\x00-\x7F]/g, "");
        }

        setErrorMsg(cleanedMessage);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Fallo de red:', error);
      setErrorMsg('No se pudo establecer conexión con el backend (Proxy Error).');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
            <span className="text-white text-3xl font-bold">📡</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 italic tracking-tighter">FallDetector</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Login Real (PostgreSQL)</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold uppercase animate-pulse">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Email Corporativo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none text-slate-900 font-medium transition-all"
              placeholder="admin@sistema.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none text-slate-900 font-medium transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full py-5 rounded-2xl text-white font-black text-sm uppercase transition-all ${
              !isFormValid || isLoading ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-100'
            }`}
          >
            {isLoading ? 'Verificando...' : 'Acceder al Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}