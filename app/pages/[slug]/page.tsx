"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, Upload } from "lucide-react";
import Link from "next/link";

// @ts-ignore
export default function EditPage({ params }: { params: { slug: string } }) {
  const { slug: pageSlug } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/pages/${params.slug}`);
        if (!res.ok) throw new Error("Failed to fetch page");
        const data = await res.json();
        
        if (data.page) {
          setId(data.page._id);
          setTitle(data.page.title);
          setSlug(data.page.slug);
          setSections(data.page.sections || []);
        }
      } catch (error) {
        console.error(error);
        alert("Error loading page data");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchPage();
    }
  }, [params.slug]);

  const handleAddSection = () => {
    setSections([...sections, { type: "text", content: "", image: "" }]);
  };

  const handleRemoveSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const handleSectionChange = (index: number, field: string, value: any) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      newSections[index] = { ...newSections[index], [field]: value };
      return newSections;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant preview with temporary local URL
    const localPreviewUrl = URL.createObjectURL(file);
    setSections(prevSections => {
      const newSections = [...prevSections];
      newSections[index] = { 
        ...newSections[index], 
        images: [localPreviewUrl],
        image: localPreviewUrl,
        _uploading: true // Mark as uploading
      };
      return newSections;
    });

    setSaving(true);
    const formData = new FormData();
    formData.append("file", file);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        // Replace local preview with S3 URL
        URL.revokeObjectURL(localPreviewUrl); // Clean up local URL
        setSections(prevSections => {
            const newSections = [...prevSections];
            const currentImages = newSections[index].images || [];
            const newImages = [...currentImages];
            newImages[0] = data.url;
            
            newSections[index] = { 
                ...newSections[index], 
                images: newImages, 
                image: data.url,
                _uploading: false // Upload complete
            };
            return newSections;
        });
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Image upload failed");
      // Revert to no image on error
      URL.revokeObjectURL(localPreviewUrl);
      setSections(prevSections => {
        const newSections = [...prevSections];
        newSections[index] = { 
          ...newSections[index], 
          images: [],
          image: '',
          _uploading: false
        };
        return newSections;
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const res = await fetch(`${API_URL}/pages/${id}`, {
        method: "PUT", // Using PUT to update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, sections }),
      });

      if (res.ok) {
        alert("Page Updated Successfully!");
        router.push("/");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen pb-32">
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/"
          className="flex items-center gap-2 text-[var(--verde-text)] hover:text-[var(--verde-accent)] transition-colors text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Pages
        </Link>
        <h1 className="text-2xl font-light text-[var(--verde-heading)] uppercase tracking-wider">
          Edit Page: <span className="font-medium">{title}</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Page Meta */}
        <div className="bg-white p-6 border border-[#e5e0d8] shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--verde-heading)] mb-6 border-b border-[#f3ede2] pb-2">
            Page Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                Page Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                required
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--verde-heading)]">
              Content Sections
            </h2>
            <button
              type="button"
              onClick={handleAddSection}
              className="flex items-center gap-2 bg-[var(--verde-accent)] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#a35e4d] transition-colors shadow-sm"
            >
              <Plus size={14} /> Add Section
            </button>
          </div>

          {sections.map((section, index) => (
            <div key={index} className="bg-white p-6 border border-[#e5e0d8] relative shadow-sm group">
              <button
                type="button"
                onClick={() => handleRemoveSection(index)}
                className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-colors"
                title="Remove Section"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
                {/* Image Upload Area */}
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)]">
                    Section Image
                  </label>
                  <div className="relative w-full aspect-square bg-[#faf9f6] border-2 border-dashed border-[#e5e0d8] flex flex-col items-center justify-center overflow-hidden hover:border-[var(--verde-accent)] transition-colors cursor-pointer">
                    {/* Prefer images array first item, fallback to legacy image string */}
                    {(section.images && section.images[0]) || section.image ? (
                      <>
                        <Image
                          src={section.images?.[0] || section.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized={section.images?.[0]?.startsWith('blob:')}
                        />
                        {section._uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="mx-auto mb-2 text-[#dcd6cc]" size={24} />
                        <span className="text-[10px] uppercase text-[#999] tracking-widest">Upload Image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={section._uploading}
                    />
                  </div>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                  {/* Section Type Selector */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                       Section Type
                    </label>
                    <select
                        value={section.type || 'text'}
                        onChange={(e) => handleSectionChange(index, "type", e.target.value)}
                        className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                    >
                        <option value="text">Text Block</option>
                        <option value="hero">Hero Section</option>
                        <option value="gallery">Gallery</option>
                        <option value="menu">Menu List</option>
                        <option value="parallax">Parallax Section</option>
                    </select>
                  </div>

                  {/* Heading & Subheading */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                            Heading
                         </label>
                         <input
                            type="text"
                            value={section.heading || ''}
                            onChange={(e) => handleSectionChange(index, "heading", e.target.value)}
                            className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                            placeholder="Section Heading"
                         />
                    </div>
                    {/* Only show Subheading for Hero */}
                    {section.type === 'hero' && (
                        <div>
                             <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                                Subheading
                             </label>
                             <input
                                type="text"
                                value={section.subheading || ''}
                                onChange={(e) => handleSectionChange(index, "subheading", e.target.value)}
                                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                                placeholder="Subtitle text"
                             />
                        </div>
                    )}
                  </div>
                  
                  {/* Hero Specifics: CTA */}
                  {section.type === 'hero' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                                CTA Link
                            </label>
                            <input
                                type="text"
                                value={section.ctaLink || ''}
                                onChange={(e) => handleSectionChange(index, "ctaLink", e.target.value)}
                                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                                placeholder="/url"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                                CTA Text
                            </label>
                            <input
                                type="text"
                                value={section.ctaText || ''}
                                onChange={(e) => handleSectionChange(index, "ctaText", e.target.value)}
                                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                                placeholder="Button Text"
                            />
                        </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                       Content
                    </label>
                    <textarea
                      value={section.content}
                      onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                      rows={6}
                      className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-4 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)] leading-relaxed"
                      placeholder="Enter section content..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e0d8] p-4 flex justify-end gap-4 shadow-lg z-50">
          <Link
            href="/"
            className="px-6 py-3 border border-[#e5e0d8] text-[var(--verde-heading)] text-xs uppercase tracking-widest hover:bg-[#faf9f6] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[var(--verde-heading)] text-[#f3ede2] px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors shadow-md disabled:opacity-50"
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}