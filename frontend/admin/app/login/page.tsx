'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/auth';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login(username, password) as { token: string };
      setToken(data.token);
      router.push('/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F7F4' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[#005B41] font-bold text-xl">Mazaya FM</div>
          <div className="text-[#6B6B65] text-xs uppercase tracking-widest mt-1">Operations Console</div>
        </div>
        <div className="rounded-xl p-8" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
          <h1 className="text-base font-semibold mb-6" style={{ color: '#1A1A18' }}>Sign in to your account</h1>
          {error && (
            <div className="mb-4 text-sm text-[#A32D2D] bg-[#FBEAEA] rounded-lg px-4 py-2">{error}</div>
          )}
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
