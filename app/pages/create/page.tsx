// @ts-nocheck
"use client";

import { useState } from "react";
import Image from "next/image";

export default function Create() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [sections, setSections] = useState([{ type: "text", content: "" }]);
  const [loading, setLoading] = useState(false);

  const handleSectionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // ... logic for complex nested state
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
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
            // Update section with new image URL
            const newSections = [...sections];
            (newSections[index] as any).image = data.url;
            setSections(newSections);
        }
    } catch (error) {
        console.error("Upload failed", error);
    } finally {
        setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
        const res = await fetch(`${API_URL}/pages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, slug, sections }),
        });
        if (res.ok) {
            alert("Page Created!");
            // redirect logic here
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-3xl font-light text-[var(--verde-heading)] uppercase tracking-wider mb-8">
        Create New Page
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
              Page Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors"
              placeholder="e.g. Summer Menu"
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
              className="w-full bg-white border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors"
              placeholder="e.g. summer-menu"
              required
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#e5e0d8] pb-4">
            <h3 className="text-xl font-light uppercase tracking-wide text-[var(--verde-heading)]">
              Content Sections
            </h3>
          </div>
          
          {sections.map((section, index) => (
            <div key={index} className="p-6 bg-white border border-[#e5e0d8] shadow-sm space-y-4 relative group">
              <div className="absolute top-4 right-4 text-xs text-[var(--verde-text)] uppercase tracking-widest opacity-50">
                Section {index + 1}
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                  Section Type
                </label>
                <select 
                  className="w-full bg-[#fcfbf9] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)]"
                  name="type"
                >
                  <option value="text">Text Block</option>
                  <option value="hero">Hero Image</option>
                  <option value="gallery">Photo Gallery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                  Content / Description
                </label>
                <textarea 
                  className="w-full bg-[#fcfbf9] border border-[#e5e0d8] p-3 h-32 focus:outline-none focus:border-[var(--verde-accent)]"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                  Upload Image (AWS S3)
                </label>
                <input 
                  type="file" 
                  onChange={(e) => handleImageUpload(e, index)} 
                  className="block w-full text-sm text-[var(--verde-text)] file:mr-4 file:py-2 file:px-6 file:rounded-none file:border-0 file:text-xs file:font-medium file:uppercase file:tracking-widest file:bg-[var(--verde-heading)] file:text-white hover:file:bg-[var(--verde-accent)] transition-colors"
                />
              </div>
              
              {loading && <p className="text-xs text-[var(--verde-accent)] uppercase tracking-widest animate-pulse">Uploading...</p>}
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={() => setSections([...sections, { type: "text", content: "" }])} 
            className="w-full py-4 border-2 border-dashed border-[#e5e0d8] text-[var(--verde-text)] uppercase tracking-widest text-xs hover:border-[var(--verde-accent)] hover:text-[var(--verde-accent)] transition-colors"
          >
            + Add Another Section
          </button>
        </div>

        <div className="pt-6 border-t border-[#e5e0d8]">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[var(--verde-heading)] text-white py-4 uppercase tracking-[0.2em] hover:bg-[var(--verde-accent)] disabled:bg-gray-400 transition-colors duration-300"
          >
            {loading ? "Saving..." : "Create Page"}
          </button>
        </div>
      </form>
    </div>
  );  
}
