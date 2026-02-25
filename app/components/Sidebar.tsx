"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutTemplate, Menu, X, Settings, LogOut } from "lucide-react";
import { logout, getBackendUrl } from "@/lib/auth";

export default function Sidebar() {
  const [pages, setPages] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch(`${getBackendUrl()}/pages`);
        if (!res.ok) return;
        const data = await res.json();
        setPages(data.pages || []);
      } catch (e) {
        console.error("Sidebar fetch error", e);
      }
    };
    fetchPages();
  }, []);

  // Auto-close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Hide sidebar on login page — AFTER all hooks (React rules)
  if (pathname === '/login') return null;

  return (
    <>
      {/* ─── Mobile top bar ─────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#f8f5f2] border-b border-[#e5e0d8] flex items-center px-4 gap-3 shadow-sm">
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-[var(--verde-heading)] hover:text-[var(--verde-accent)] transition-colors rounded"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <Link
          href="/"
          className="text-base font-light text-[var(--verde-heading)] uppercase tracking-wider flex items-center gap-2"
        >
          <LayoutTemplate size={18} />
          Verde CMS
        </Link>
      </div>

      {/* ─── Mobile backdrop overlay ─────────────────────── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ─── Sidebar panel ───────────────────────────────── */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-72
          bg-[#f8f5f2] border-r border-[#e5e0d8]
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:w-64
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#e5e0d8] flex items-center justify-between flex-shrink-0">
          <Link
            href="/"
            className="text-lg font-light text-[var(--verde-heading)] uppercase tracking-wider flex items-center gap-2"
          >
            <LayoutTemplate size={20} />
            Verde CMS
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 text-[var(--verde-text)] hover:text-[var(--verde-accent)] transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pages list */}
        <div className="flex-1 py-4 overflow-y-auto">
          <h3 className="px-6 text-xs uppercase tracking-widest text-[var(--verde-text)] mb-3 font-bold">
            Pages
          </h3>
          <nav className="space-y-0.5">
            {pages.length === 0 && (
              <p className="px-6 py-3 text-xs text-[var(--verde-text)] opacity-50">Loading pages…</p>
            )}
            {pages.map((page: any) => {
              const isActive = pathname === `/pages/${page.slug}`;
              return (
                <Link
                  key={page._id}
                  href={`/pages/${page.slug}`}
                  className={`block px-6 py-3 text-sm uppercase tracking-wide transition-colors border-l-2 ${
                    isActive
                      ? "text-[var(--verde-accent)] bg-[#efebe5] border-[var(--verde-accent)]"
                      : "text-[var(--verde-heading)] hover:bg-[#efebe5] hover:text-[var(--verde-accent)] border-transparent hover:border-[var(--verde-accent)]"
                  }`}
                >
                  {page.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom area: New Page + Settings + Logout */}
        <div className="p-4 border-t border-[#e5e0d8] flex-shrink-0 space-y-2">
{/* New Page button hidden — route /pages/create still accessible */}

          {/* Settings */}
          <Link
            href="/settings"
            className={`flex items-center gap-2 w-full px-4 py-2.5 text-xs uppercase tracking-widest border transition-colors ${
              pathname === '/settings'
                ? 'border-[var(--verde-accent)] text-[var(--verde-accent)] bg-[#efebe5]'
                : 'border-[#e5e0d8] text-[var(--verde-text)] hover:border-[var(--verde-accent)] hover:text-[var(--verde-accent)] hover:bg-[#efebe5]'
            }`}
          >
            <Settings size={14} /> Settings
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs uppercase tracking-widest border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}