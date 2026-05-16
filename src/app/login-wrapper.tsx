'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function LoginPageWrapper() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      toast.success('Login berhasil!');
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login gagal';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoUser: string) => {
    setUsername(demoUser);
    setIsLoading(true);
    setError('');

    try {
      const demoPasswords: Record<string, string> = {
        admin: 'admin123',
        guru: 'guru123',
        murid: 'murid123',
      };

      await login(demoUser, demoPasswords[demoUser] || '');
      toast.success(`Login sebagai ${demoUser} berhasil!`);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login gagal';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
      setUsername('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 relative overflow-hidden bg-cover bg-center" 
         style={{ backgroundImage: 'linear-gradient(to bottom, rgba(22, 163, 74, 0.4), rgba(0, 0, 0, 0.7)), url("/assets/images/login-bg.jpg")' }}>
      
      {/* Spacer Top (Desktop only to balance center) */}
      <div className="hidden sm:block h-20"></div>

      <div className="w-full max-w-[320px] sm:max-w-sm relative z-10 py-8 sm:py-0">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="mb-2 sm:mb-3 flex justify-center">
            <img src="/assets/images/Logo_SUKMA_1_-1778584431642.png" alt="LMS Logo" className="h-12 sm:h-16 drop-shadow-lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg uppercase tracking-tight text-center leading-tight">
            LEARNING MANAGEMENT SYSTEM
          </h1>
          <p className="text-sm sm:text-base mt-2 font-bold text-white drop-shadow-md text-center">
            MI ISLAMIYAH - Malang
          </p>
        </div>

        {/* Login Form */}
        <div className="p-0 sm:p-2">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex gap-2 p-3 rounded-xl bg-red-50/80 border border-red-100 backdrop-blur-sm">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-red-600 font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-[10px] sm:text-sm font-bold text-white drop-shadow-sm uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                disabled={isLoading}
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-white/40 bg-white/20 backdrop-blur-md outline-none focus:border-white focus:ring-4 focus:ring-white/10 transition-all placeholder:text-white/50 text-white text-sm font-medium"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-[10px] sm:text-sm font-bold text-white drop-shadow-sm uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                disabled={isLoading}
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-white/40 bg-white/20 backdrop-blur-md outline-none focus:border-white focus:ring-4 focus:ring-white/10 transition-all placeholder:text-white/50 text-white text-sm font-medium"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 border border-white/10 text-sm sm:text-base"
            >
              {isLoading ? 'Sedang login...' : 'Masuk ke Sistem'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer (Fixed to bottom) */}
      <div className="w-full text-center space-y-2 pb-6 sm:pb-8 relative z-10 mt-auto">
         <p className="text-white text-[9px] sm:text-xs font-bold tracking-[0.2em] drop-shadow-lg uppercase px-4">
           Lembaga Pendidikan Islam Kebonsari - MALANG
         </p>
         <div className="w-8 h-0.5 bg-white/30 mx-auto rounded-full"></div>
      </div>
    </div>
  );
}
