'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Key, Mail, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { authFetch, setAuthToken, logout } from '@/lib/auth';

export default function SettingsPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Naya password aur confirm password match nahi kar rahe');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error('Password kam az kam 6 characters ka hona chahiye');
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newEmail, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        // Update token with new one if returned
        if (data.token) {
          setAuthToken(data.token);
        }
        toast.success(data.message || 'Credentials update ho gaye!');
        setCurrentPassword('');
        setNewEmail('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        if (res.status === 401) {
          toast.error('Session expired. Please login again.');
          router.push('/login');
          return;
        }
        toast.error(data.message || 'Kuch ghalat ho gaya');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-light uppercase tracking-wider text-[var(--verde-heading)]">
          Settings
        </h1>
        <p className="text-xs text-[var(--verde-text)] mt-1 opacity-60 uppercase tracking-widest">
          Admin Credentials Manage Karen
        </p>
      </div>

      {/* Change Credentials Card */}
      <div className="bg-white border border-[#e5e0d8] shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#f3ede2]">
          <ShieldCheck size={16} className="text-[var(--verde-accent)]" />
          <h2 className="text-xs uppercase tracking-widest text-[var(--verde-heading)] font-bold">
            Credentials Tabdeel Karen
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password - Required */}
          <div>
            <label className="flex items-center gap-1 text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
              <Key size={11} /> Purana Password <span className="text-red-400">(zaruri)</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Current password daalen"
                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 pr-10 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[var(--verde-text)] transition-colors"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="border-t border-[#f3ede2] pt-5">
            <p className="text-[10px] uppercase tracking-widest text-[var(--verde-text)] opacity-50 mb-4">
              Naya Email / Password (jo bhi badalna ho woh bhar dein)
            </p>

            {/* New Email - Optional */}
            <div className="mb-4">
              <label className="flex items-center gap-1 text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                <Mail size={11} /> Naya Email <span className="text-gray-400 text-[10px] normal-case">(optional)</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="naya-email@verdenyc.com"
                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors placeholder-[#ccc]"
              />
            </div>

            {/* New Password - Optional */}
            <div className="mb-4">
              <label className="flex items-center gap-1 text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                <Key size={11} /> Naya Password <span className="text-gray-400 text-[10px] normal-case">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Naya password (6+ characters)"
                  className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 pr-10 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors placeholder-[#ccc]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[var(--verde-text)] transition-colors"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {newPassword && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                  Password Confirm Karen
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Password dobara likhein"
                  className={`w-full bg-[#faf9f6] border p-3 text-sm text-[var(--verde-heading)] focus:outline-none transition-colors ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-[#e5e0d8] focus:border-[var(--verde-accent)]'
                  }`}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-red-500 text-[10px] mt-1 uppercase tracking-wide">Passwords match nahi kar rahe</p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[var(--verde-heading)] text-[#f3ede2] py-3 text-xs uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 mt-2"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Logout Card */}
      <div className="bg-white border border-[#e5e0d8] shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[var(--verde-heading)] font-bold mb-1">
              Logout
            </h3>
            <p className="text-[11px] text-[var(--verde-text)] opacity-60">
              CMS se باہر نکلیں
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 border border-red-300 text-red-600 text-xs uppercase tracking-widest hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
