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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center" 
         style={{ backgroundImage: 'linear-gradient(to bottom, rgba(22, 163, 74, 0.4), rgba(0, 0, 0, 0.7)), url("/assets/images/login-bg.jpg")' }}>
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img src="/assets/images/Logo_SUKMA_1_-1778584431642.png" alt="SUKMA Logo" className="h-20 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-black text-white drop-shadow-md">
            SUKMA
          </h1>
          <p className="text-base mt-2 font-medium text-white/90 drop-shadow-sm">
            Sistem Manajemen Sekolah MI Islamiyah Malang
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? 'Sedang login...' : 'Masuk ke Sistem'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center space-y-2">
           <p className="text-white text-sm font-bold tracking-wide drop-shadow-md">
             Lembaga Pendidikan Islam Kebonsari - MALANG
           </p>
           <div className="w-12 h-1 bg-white/30 mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
