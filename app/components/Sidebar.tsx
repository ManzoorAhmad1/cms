import Link from "next/link";
import { Plus, LayoutTemplate } from "lucide-react";

async function getPages() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${API_URL}/pages`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.pages || [];
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    return [];
  }
}

export default async function Sidebar() {
  const pages = await getPages();

  return (
    <div className="w-64 bg-[#f8f5f2] border-r border-[#e5e0d8] h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-[#e5e0d8]">
        <Link href="/" className="text-xl font-light text-[var(--verde-heading)] uppercase tracking-wider flex items-center gap-2">
          <LayoutTemplate size={20} />
          Verde CMS
        </Link>
      </div>
      
      <div className="flex-1 py-4">
        <h3 className="px-6 text-xs uppercase tracking-widest text-[var(--verde-text)] mb-4 font-bold">
          Pages
        </h3>
        <nav className="space-y-1">
          {pages.map((page: any) => (
            <Link
              key={page._id}
              href={`/pages/${page.slug}`}
              className="block px-6 py-3 text-sm text-[var(--verde-heading)] hover:bg-[#efebe5] hover:text-[var(--verde-accent)] transition-colors uppercase tracking-wide border-l-2 border-transparent hover:border-[var(--verde-accent)]"
            >
              {page.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-[#e5e0d8]">
        <Link
          href="/pages/create"
          className="flex items-center justify-center gap-2 w-full bg-[var(--verde-heading)] text-[#f3ede2] py-3 text-xs uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors"
        >
          <Plus size={16} /> New Page
        </Link>
      </div>
    </div>
  );
}