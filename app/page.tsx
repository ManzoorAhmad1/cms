import Link from "next/link";
import { Plus, Edit } from "lucide-react";

async function getPages() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl text-[var(--verde-heading)] uppercase tracking-wider font-light">
          CMS Dashboard
        </h1>
        <Link 
          href="/pages/create" 
          className="bg-[var(--verde-accent)] hover:bg-[#7a3628] text-white px-6 py-3 rounded-none uppercase tracking-widest text-sm flex items-center gap-2 transition-all duration-300"
        >
          <Plus size={18} />
          ADD NEW PAGE
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      
      <div className="mt-16 p-8 bg-white border border-[#e5e0d8]">
        <h3 className="text-[var(--verde-heading)] text-lg uppercase tracking-widest mb-4">Setup Guide</h3>
        <p className="text-[var(--verde-text)] text-sm leading-loose">
          1. Create a <strong>.env.local</strong> file in this folder.<br/>
          2. Add your <strong>MONGODB_URI</strong> to connect the database.<br/>
          3. Add your <strong>AWS_ACCESS_KEY_ID</strong>, <strong>AWS_SECRET_ACCESS_KEY</strong>, and <strong>AWS_S3_BUCKET_NAME</strong> for image uploads.<br/>
          4. Run <strong>npm install</strong> and then <strong>npm run dev</strong> to start the CMS.
        </p>
      </div>
    </div>
  );
}
