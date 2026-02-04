'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // Validaciones visuales del formulario
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Usamos trim() para evitar errores por espacios accidentales
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password: password.trim() 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || 'Error en la autenticación');
        setIsLoading(false);
        return;
      }

      // 1. GUARDADO DOBLE DE SESIÓN
      // Guardamos en LocalStorage para la lógica del Frontend
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Guardamos en Cookies para que el Middleware/Layout pueda leerlo inmediatamente
      document.cookie = `token=${data.token}; path=/; max-age=28800; SameSite=Lax`;

      console.log('✅ Sesión guardada. Datos de usuario:', data.user);

      // 2. REDIRECCIÓN CONTROLADA
      // Añadimos un pequeño delay (100ms) para asegurar que el navegador termine de escribir los datos
      setTimeout(() => {
        setIsLoading(false);
        
        // Normalizamos el ID del rol (soportamos roleId y role_id)
        const roleId = Number(data.user.roleId || data.user.role_id);
        
        let targetPath = '/dashboard';
        if (roleId === 1) targetPath = '/dashboard/admin';
        else if (roleId === 2) targetPath = '/dashboard/cuidador';
        else if (roleId === 3) targetPath = `/dashboard/usuario/${data.user.device_id || '1'}`;

        console.log('✈️ Redirigiendo a:', targetPath);
        
        // Usamos window.location.href para forzar una carga limpia y evitar bloqueos del Router
        window.location.href = targetPath;
      }, 100);

    } catch (error) {
      console.error('Fallo de red:', error);
      setErrorMsg('No se pudo conectar con el servidor.');
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
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Acceso al Sistema Real</p>
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
              !isFormValid || isLoading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-100'
            }`}
          >
            {isLoading ? 'Verificando...' : 'Acceder al Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}