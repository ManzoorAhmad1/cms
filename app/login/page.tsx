'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LayoutTemplate, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success || data.message === 'Login successful') {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || data.message || 'Login failed');
      }
    } catch {
      setError('Network error. Server se connect nahi ho saka.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#faf9f6] flex items-center justify-center px-4">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url('/mila-miami-texture.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--verde-heading)] flex items-center justify-center">
              <LayoutTemplate size={20} className="text-[#f3ede2]" />
            </div>
            <span className="text-2xl font-light text-[var(--verde-heading)] uppercase tracking-[0.3em]">
              Verde CMS
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest text-[var(--verde-text)] opacity-60">
            Admin Access Only
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e5e0d8] shadow-lg p-8">
          <div className="flex items-center gap-2 mb-8">
            <Lock size={14} className="text-[var(--verde-accent)]" />
            <h2 className="text-xs uppercase tracking-widest text-[var(--verde-heading)] font-semibold">
              Sign In
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@verdenyc.com"
                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors placeholder-[#ccc]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 pr-10 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors placeholder-[#ccc]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[var(--verde-text)] transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 uppercase tracking-wide">
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--verde-heading)] text-[#f3ede2] py-3.5 text-xs uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] uppercase tracking-widest text-[var(--verde-text)] opacity-40 mt-6">
          Verde NYC — Content Management System
        </p>
      </div>
    </div>
  );
}
