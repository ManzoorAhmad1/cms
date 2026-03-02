'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Key, Mail, ShieldCheck, Globe, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { authFetch, setTokens, logout, getBackendUrl } from '@/lib/auth';

export default function SettingsPage() {
  const router = useRouter();

  // Site Settings state
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [siteKeywords, setSiteKeywords] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [savingSite, setSavingSite] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Admin credentials state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch site settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true);
      try {
        const res = await fetch(`${getBackendUrl()}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSiteTitle(data.settings.siteTitle || '');
            setSiteDescription(data.settings.siteDescription || '');
            setSiteKeywords(data.settings.siteKeywords || '');
            setPhone(data.settings.phone || '');
            setEmail(data.settings.email || '');
            setInstagramUrl(data.settings.instagramUrl || '');
          }
        }
      } catch (e) {
        console.error('Failed to fetch site settings', e);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  // Save site settings
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSite(true);
    try {
      const res = await authFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          siteTitle,
          siteDescription,
          siteKeywords,
          phone,
          email,
          instagramUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Site settings saved!');
      } else {
        toast.error(data.message || 'Failed to save');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setSavingSite(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
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
        // Update tokens with new ones if returned
        if (data.accessToken && data.refreshToken) {
          setTokens(data.accessToken, data.refreshToken);
        }
        toast.success(data.message || 'Credentials updated successfully!');
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
        toast.error(data.message || 'Something went wrong');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
           <h3 className="text-xl font-light uppercase tracking-wider text-[var(--verde-heading)]">
          Settings
           </h3>
        <p className="text-xs text-[var(--verde-text)] mt-1 opacity-60 uppercase tracking-widest">
          Manage Site & Admin Settings
        </p>
      </div>

      {/* Site Settings Card */}
      <div className="bg-white border border-[#e5e0d8] shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#f3ede2]">
          <Globe size={16} className="text-[var(--verde-accent)]" />
          <h2 className="text-xs uppercase tracking-widest text-[var(--verde-heading)] font-bold">
            Site Settings
          </h2>
        </div>

        {loadingSettings ? (
          <div className="text-center py-8 text-[var(--verde-text)] text-sm">Loading settings...</div>
        ) : (
        <form onSubmit={handleSaveSiteSettings} className="space-y-5">
          {/* Site Title */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
              Site Title <span className="text-[10px] text-gray-400 normal-case">(appears in browser tab)</span>
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Verde NYC | Festive Restaurant in New York"
              className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors"
            />
          </div>

          {/* Site Description */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
              Site Description <span className="text-[10px] text-gray-400 normal-case">(SEO meta description)</span>
            </label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={3}
              placeholder="Discover Verde NYC in the Meatpacking District..."
              className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors leading-relaxed"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
              Keywords <span className="text-[10px] text-gray-400 normal-case">(comma separated)</span>
            </label>
            <input
              type="text"
              value={siteKeywords}
              onChange={(e) => setSiteKeywords(e.target.value)}
              placeholder="Verde NYC, Mediterranean restaurant, New York"
              className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 646 776 3660"
                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@verde-nyc.com"
                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors"
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
              Instagram URL
            </label>
            <input
              type="text"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/verdenyc"
              className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 text-sm text-[var(--verde-heading)] focus:outline-none focus:border-[var(--verde-accent)] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={savingSite}
            className="flex items-center justify-center gap-2 w-full bg-[var(--verde-accent)] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#7a9a56] transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {savingSite ? 'Saving...' : 'Save Site Settings'}
          </button>
        </form>
        )}
      </div>

      {/* Change Credentials Card */}
      <div className="bg-white border border-[#e5e0d8] shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#f3ede2]">
          <ShieldCheck size={16} className="text-[var(--verde-accent)]" />
          <h2 className="text-xs uppercase tracking-widest text-[var(--verde-heading)] font-bold">
            Change Credentials
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password - Required */}
          <div>
            <label className="flex items-center gap-1 text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
              <Key size={11} /> Current Password <span className="text-red-400">(required)</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
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
              New Email / Password (fill in what you want to change)
            </p>

            {/* New Email - Optional */}
            <div className="mb-4">
              <label className="flex items-center gap-1 text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                <Mail size={11} /> New Email <span className="text-gray-400 text-[10px] normal-case">(optional)</span>
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
                <Key size={11} /> New Password <span className="text-gray-400 text-[10px] normal-case">(optional)</span>
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
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full bg-[#faf9f6] border p-3 text-sm text-[var(--verde-heading)] focus:outline-none transition-colors ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-[#e5e0d8] focus:border-[var(--verde-accent)]'
                  }`}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-red-500 text-[10px] mt-1 uppercase tracking-wide">Passwords do not match</p>
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
              Sign out of CMS
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
