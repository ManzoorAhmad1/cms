"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Upload, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import Image from "next/image";
// @ts-ignore
import SectionCard from "../../components/SectionCard";

export default function EditPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  
  // Section Editing Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(null);
  const [editingSection, setEditingSection] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
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

  // -- Section CRUD -- //

  const handleAddSection = () => {
    const newSection = { type: "text", heading: "New Section", content: "", images: [] };
    const newSections = [...sections, newSection];
    setSections(newSections);
    // Automatically open modal for new section
    setEditingSection(newSection);
    setCurrentSectionIndex(newSections.length - 1); // Index of the new one
    setModalOpen(true);
  };

  const handleEditSection = (index: number) => {
    setCurrentSectionIndex(index);
    setEditingSection({ ...sections[index] }); // Clone to avoid direct mutation
    setModalOpen(true);
  };

  const handleDeleteSection = (index: number) => {
    if (confirm("Are you sure you want to delete this section?")) {
      const newSections = sections.filter((_, i) => i !== index);
      setSections(newSections);
    }
  };

  const saveSectionModal = () => {
    if (currentSectionIndex !== null) {
      const newSections = [...sections];
      newSections[currentSectionIndex] = editingSection;
      setSections(newSections);
      setModalOpen(false);
      setEditingSection(null);
      setCurrentSectionIndex(null);
    }
  };

  // -- Image Upload Logic for Modal -- //
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local loading state could be added here
    const formData = new FormData();
    formData.append("file", file);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        // Update editingSection state
        setEditingSection((prev: any) => ({
          ...prev,
          images: prev.images ? [...prev.images, data.url] : [data.url],
          image: data.url // Fallback for old structure
        }));
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Image upload failed");
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    setEditingSection((prev: any) => ({
      ...prev,
      images: prev.images ? prev.images.filter((img: string) => img !== imgUrl) : [],
      image: prev.image === imgUrl ? "" : prev.image
    }));
  };

  // -- Master Save -- //
  const handleSavePage = async () => {
    setSaving(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    try {
      const res = await fetch(`${API_URL}/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, sections }),
      });

      if (res.ok) {
        alert("Page Saved Successfully!");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--verde-text)]">Loading Page Data...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen pb-32 ml-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#e5e0d8] sticky top-0 bg-[#faf9f6] z-10 pt-4">
        <div>
             <h3 className="text-3xl font-light text-[var(--verde-heading)] uppercase tracking-wider mb-2">
            {title}
             </h3>
          <p className="text-sm text-[var(--verde-text)] tracking-wide">/{slug}</p>
        </div>
        <div className="flex gap-4">
           <button
            onClick={handleAddSection}
            className="flex items-center gap-2 border border-[var(--verde-accent)] text-[var(--verde-accent)] px-6 py-3 text-xs uppercase tracking-widest hover:bg-[var(--verde-accent)] hover:text-white transition-colors"
          >
            <Plus size={16} /> Add Section
          </button>
          <button
            onClick={handleSavePage}
            disabled={saving}
            className="flex items-center gap-2 bg-[var(--verde-heading)] text-[#f3ede2] px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors shadow-md disabled:opacity-50"
          >
            {saving ? "Saving..." : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <SectionCard 
            key={index} 
            section={section} 
            index={index} 
            onEdit={() => handleEditSection(index)}
            onDelete={() => handleDeleteSection(index)}
          />
        ))}
        
        {/* Empty State / Add New Card */}
        {sections.length === 0 && (
          <button 
            onClick={handleAddSection}
            className="h-64 border-2 border-dashed border-[#e5e0d8] flex flex-col items-center justify-center text-[#999] hover:border-[var(--verde-accent)] hover:text-[var(--verde-accent)] transition-colors group bg-white"
          >
            <Plus size={48} className="mb-4 opacity-50 group-hover:opacity-100" />
            <span className="uppercase tracking-widest text-xs">Add First Section</span>
          </button>
        )}
      </div>

      {/* -- EDIT SECTION MODAL -- */}
      {modalOpen && editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-none shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#e5e0d8] bg-white sticky top-0 z-10">
              <h2 className="text-xl text-[var(--verde-heading)] uppercase tracking-widest font-bold flex items-center gap-2">
                Edit Section <span className="text-[var(--verde-accent)] text-xs font-normal bg-[#f3ede2] px-2 py-1 rounded-sm">{editingSection.type}</span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#999] hover:text-black transition-colors p-2 hover:bg-[#faf9f6] rounded-full">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 overflow-y-auto flex-1 bg-[#faf9f6]">
              
              <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
                {/* Left Column: Settings */}
                <div className="space-y-6 bg-white p-6 border border-[#e5e0d8] shadow-sm">
                   <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2 font-bold">Section Type</label>
                    <select 
                      value={editingSection.type}
                      onChange={(e) => setEditingSection({...editingSection, type: e.target.value})}
                      className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] text-sm"
                    >
                      <option value="text">Text / Generic Content</option>
                      <option value="hero">Hero / Banner</option>
                      <option value="features">Features / Highlights</option>
                      <option value="gallery">Photo Gallery</option>
                      <option value="menu">Menu List</option>
                      <option value="contact_info">Contact Info</option>
                      <option value="philosophy">Philosophy / Quote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2 font-bold">Heading</label>
                    <input 
                      type="text" 
                      value={editingSection.heading || ""} 
                      onChange={(e) => setEditingSection({...editingSection, heading: e.target.value})}
                      className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] text-[var(--verde-heading)]"
                      placeholder="Enter a heading..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2 font-bold">Subheading</label>
                    <input 
                      type="text" 
                      value={editingSection.subheading || ""} 
                      onChange={(e) => setEditingSection({...editingSection, subheading: e.target.value})}
                      className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] text-[var(--verde-heading)]"
                      placeholder="Enter a subheading..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2 font-bold">Main Content</label>
                    <textarea 
                      rows={10}
                      value={editingSection.content || ""} 
                      onChange={(e) => setEditingSection({...editingSection, content: e.target.value})}
                      className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] text-[var(--verde-heading)] leading-relaxed resize-y"
                      placeholder="Write your content here..."
                    />
                  </div>

                   {/* Conditional Fields based on Type */}
                   {editingSection.type === 'hero' && (
                     <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#f3ede2]">
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">CTA Text</label>
                          <input 
                            type="text" 
                            value={editingSection.ctaText || ""} 
                            onChange={(e) => setEditingSection({...editingSection, ctaText: e.target.value})}
                            className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-2 focus:outline-none focus:border-[var(--verde-accent)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">CTA Link</label>
                          <input 
                            type="text" 
                            value={editingSection.ctaLink || ""} 
                            onChange={(e) => setEditingSection({...editingSection, ctaLink: e.target.value})}
                            className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-2 focus:outline-none focus:border-[var(--verde-accent)]"
                          />
                        </div>
                     </div>
                   )}
                </div>

                {/* Right Column: Images */}
                <div className="space-y-6 bg-white p-6 border border-[#e5e0d8] shadow-sm h-fit">
                   <div className="flex items-center justify-between mb-4">
                      <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] font-bold">
                        Images
                      </label>
                      <span className="text-[10px] text-[#999] uppercase tracking-wider">{editingSection.images?.length || 0} items</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {/* Existing Images */}
                      {editingSection.images && editingSection.images.map((img: string, i: number) => (
                        <div key={i} className="relative aspect-square border border-[#e5e0d8] group bg-[#faf9f6]">
                           <Image src={img} alt="Preview" fill className="object-cover" />
                           <button 
                             onClick={() => handleRemoveImage(img)}
                             className="absolute top-1 right-1 bg-white/90 text-red-500 hover:bg-red-500 hover:text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                             title="Remove Image"
                           >
                              <X size={14} />
                           </button>
                        </div>
                      ))}
                      
                      {/* Fallback for single image field support */}
                       {editingSection.image && !editingSection.images && (
                        <div className="relative aspect-square border border-[#e5e0d8] group bg-[#faf9f6]">
                           <Image src={editingSection.image} alt="Preview" fill className="object-cover" />
                           <button 
                             onClick={() => setEditingSection({...editingSection, image: ""})}
                             className="absolute top-1 right-1 bg-white/90 text-red-500 hover:bg-red-500 hover:text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                           >
                              <X size={14} />
                           </button>
                        </div>
                      )}

                      {/* Upload Box */}
                      <label className="aspect-square border-2 border-dashed border-[#e5e0d8] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--verde-accent)] transition-colors bg-[#faf9f6] group min-h-[120px]">
                        <Upload className="text-[#dcd6cc] group-hover:text-[var(--verde-accent)] mb-2 transition-colors" size={24} />
                        <span className="text-[10px] uppercase text-[#999] group-hover:text-[var(--verde-accent)] transition-colors text-center px-2">Click to Upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                   </div>
                   
                   <p className="text-[10px] text-[#999]   leading-tight">
                     * Uploaded images are automatically saved to the server. Click 'Done Editing' to save text changes.
                   </p>
                </div>
              </div>

            </div>

             {/* Modal Footer */}
             <div className="p-6 border-t border-[#e5e0d8] bg-white flex justify-between items-center sticky bottom-0 z-10">
                <button 
                    onClick={() => handleDeleteSection(currentSectionIndex!)}
                    className="flex items-center gap-2 text-red-400 hover:text-red-600 uppercase text-xs tracking-widest transition-colors"
                >
                    <Trash2 size={16} /> Delete Section
                </button>

                <div className="flex gap-4">
                    <button 
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-3 border border-[#e5e0d8] text-[var(--verde-heading)] text-xs uppercase tracking-widest hover:bg-[#faf9f6] transition-colors"
                    >
                    Cancel
                    </button>
                    <button 
                    onClick={saveSectionModal}
                    className="px-8 py-3 bg-[var(--verde-heading)] text-[#f3ede2] text-xs uppercase tracking-widest hover:bg-[#1a1a1a] shadow-md transition-all hover:px-10"
                    >
                    Done Editing
                    </button>
                </div>
             </div>

          </div>
        </div>
      )}
    </div>
  );
}