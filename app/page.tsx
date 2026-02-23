import Link from "next/link";
import { Edit } from "lucide-react";

async function getPages() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${API_URL}/pages`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error("Failed to fetch pages");
    }
    const data = await res.json();
    return data.pages || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Dashboard() {
  const pages = await getPages();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl text-[var(--verde-heading)] uppercase tracking-wider font-light">
          CMS Dashboard
        </h1>
{/* New Page button hidden — route /pages/create still accessible */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8">
        {pages.map((page: any) => (
          <div key={page._id} className="bg-white p-8 shadow-sm border border-[#e5e0d8] hover:shadow-lg transition-all duration-500 group">
            <h2 className="text-2xl text-[var(--verde-heading)] mb-2 uppercase tracking-wide group-hover:text-[var(--verde-accent)] transition-colors">
              {page.title}
            </h2>
            <p className="text-[var(--verde-text)] text-sm mb-6 tracking-wider">/{page.slug}</p>
            <div className="flex justify-end pt-4 border-t border-[#f3ede2]">
              <Link href={`/pages/${page.slug}`} className="text-[var(--verde-heading)] hover:text-[var(--verde-accent)] flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] transition-colors">
                <Edit size={14} />
                EDIT
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
