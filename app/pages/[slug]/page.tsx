"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, Upload } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

// @ts-ignore
export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: pageSlug } = use(params);
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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${API_URL}/pages/${pageSlug}`);
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
        toast.error("Error loading page data");
      } finally {
        setLoading(false);
      }
    };

    if (pageSlug) {
      fetchPage();
    }
  }, [pageSlug]);

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

  const handleItemChange = (sectionIndex: number, itemIndex: number, field: string, value: any) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      const items = [...(newSections[sectionIndex].items || [])];
      items[itemIndex] = { ...items[itemIndex], [field]: value };
      newSections[sectionIndex] = { ...newSections[sectionIndex], items };
      return newSections;
    });
  };

  const handlePhilosophyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number, imageIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setSections(prevSections => {
      const newSections = [...prevSections];
      const images = [...(newSections[sectionIndex].images || [])];
      images[imageIndex] = localPreviewUrl;
      newSections[sectionIndex] = { 
        ...newSections[sectionIndex], 
        images,
        [`_uploadingImage${imageIndex}`]: true 
      };
      return newSections;
    });

    setSaving(true);
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
        URL.revokeObjectURL(localPreviewUrl);
        setSections(prevSections => {
          const newSections = [...prevSections];
          const images = [...(newSections[sectionIndex].images || [])];
          images[imageIndex] = data.url;
          newSections[sectionIndex] = { 
            ...newSections[sectionIndex], 
            images,
            [`_uploadingImage${imageIndex}`]: false 
          };
          return newSections;
        });
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Image upload failed");
      URL.revokeObjectURL(localPreviewUrl);
      setSections(prevSections => {
        const newSections = [...prevSections];
        const images = [...(newSections[sectionIndex].images || [])];
        images[imageIndex] = '';
        newSections[sectionIndex] = { 
          ...newSections[sectionIndex], 
          images,
          [`_uploadingImage${imageIndex}`]: false 
        };
        return newSections;
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number, imageIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setSections(prevSections => {
      const newSections = [...prevSections];
      const images = [...(newSections[sectionIndex].images || [])];
      images[imageIndex] = localPreviewUrl;
      newSections[sectionIndex] = { 
        ...newSections[sectionIndex], 
        images,
        [`_uploadingGalleryImage${imageIndex}`]: true 
      };
      return newSections;
    });

    setSaving(true);
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
        URL.revokeObjectURL(localPreviewUrl);
        setSections(prevSections => {
          const newSections = [...prevSections];
          const images = [...(newSections[sectionIndex].images || [])];
          images[imageIndex] = data.url;
          newSections[sectionIndex] = { 
            ...newSections[sectionIndex], 
            images,
            [`_uploadingGalleryImage${imageIndex}`]: false 
          };
          return newSections;
        });
        toast.success(`Gallery image ${imageIndex + 1} uploaded`);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Gallery image upload failed");
      URL.revokeObjectURL(localPreviewUrl);
      setSections(prevSections => {
        const newSections = [...prevSections];
        const images = [...(newSections[sectionIndex].images || [])];
        images[imageIndex] = '';
        newSections[sectionIndex] = { 
          ...newSections[sectionIndex], 
          images,
          [`_uploadingGalleryImage${imageIndex}`]: false 
        };
        return newSections;
      });
    } finally {
      setSaving(false);
    }
  };

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number, itemIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setSections(prevSections => {
      const newSections = [...prevSections];
      const items = [...(newSections[sectionIndex].items || [])];
      items[itemIndex] = { ...items[itemIndex], image: localPreviewUrl, _uploading: true };
      newSections[sectionIndex] = { ...newSections[sectionIndex], items };
      return newSections;
    });

    setSaving(true);
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
        URL.revokeObjectURL(localPreviewUrl);
        setSections(prevSections => {
          const newSections = [...prevSections];
          const items = [...(newSections[sectionIndex].items || [])];
          items[itemIndex] = { ...items[itemIndex], image: data.url, _uploading: false };
          newSections[sectionIndex] = { ...newSections[sectionIndex], items };
          return newSections;
        });
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Image upload failed");
      URL.revokeObjectURL(localPreviewUrl);
      setSections(prevSections => {
        const newSections = [...prevSections];
        const items = [...(newSections[sectionIndex].items || [])];
        items[itemIndex] = { ...items[itemIndex], image: '', _uploading: false };
        newSections[sectionIndex] = { ...newSections[sectionIndex], items };
        return newSections;
      });
    } finally {
      setSaving(false);
    }
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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
      toast.error("Image upload failed");
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    try {
      const res = await fetch(`${API_URL}/pages/${id}`, {
        method: "PUT", // Using PUT to update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, sections }),
      });

      if (res.ok) {
        toast.success("Page Updated Successfully!");
        router.push("/");
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <>
      <Toaster position="top-right" />
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

          {sections.map((section, index) => {
            const needsImage = ['hero', 'parallax'].includes(section.type);
            const needsMultipleImages = ['gallery'].includes(section.type);
            
            return (
            <div key={index} className="bg-white p-6 border border-[#e5e0d8] relative shadow-sm group">
              <button
                type="button"
                onClick={() => handleRemoveSection(index)}
                className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-colors"
                title="Remove Section"
              >
                <Trash2 size={18} />
              </button>
              
              {/* Section Type Label - Read-only */}
              <div className="mb-6 bg-gray-50 border border-gray-200 p-3 rounded">
                <span className="text-xs uppercase tracking-widest text-gray-600 font-semibold">
                  {section.type === 'hero' && '⭐ Hero Section'}
                  {section.type === 'features' && '🏢 Venue Grid Section'}
                  {section.type === 'parallax' && '🖼️ Parallax Section'}
                  {section.type === 'text' && '📝 Text Block'}
                  {section.type === 'philosophy' && '🎨 Philosophy Section'}
                  {section.type === 'gallery' && '📸 Instagram Gallery'}
                  {section.type === 'menu' && '🍽️ Menu Section'}
                </span>
              </div>

              <div className={needsImage ? "grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8" : ""}>
                {/* Image Upload Area - Only show for certain types */}
                {needsImage && (
                  <div className="space-y-3">
                    <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)]">
                      Section Image
                    </label>
                    <div className="relative w-full aspect-square bg-[#faf9f6] border-2 border-dashed border-[#e5e0d8] flex flex-col items-center justify-center overflow-hidden hover:border-[var(--verde-accent)] transition-colors cursor-pointer">
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
                )}

                {/* Content Area */}
                <div className="space-y-4 flex-1">
                  {/* Heading */}
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

                  {/* Subheading - for specific types */}
                  {['hero', 'features', 'gallery'].includes(section.type) && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                        Subheading
                      </label>
                      <input
                        type="text"
                        value={section.subheading || ''}
                        onChange={(e) => handleSectionChange(index, "subheading", e.target.value)}
                        className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                        placeholder={section.type === 'gallery' ? '@instagram_handle' : 'Subtitle text'}
                      />
                    </div>
                  )}

                  {/* Content - for most types (not hero, not gallery, not philosophy) */}
                  {!['gallery', 'hero', 'philosophy'].includes(section.type) && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                        Content
                        {section.type === 'features' && (
                          <span className="text-blue-600 font-normal ml-2 text-[10px]">
                            (Each paragraph on new line - press Enter twice between paragraphs)
                          </span>
                        )}
                      </label>
                      <textarea
                        value={section.content || ''}
                        onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                        rows={section.type === 'features' ? 12 : 6}
                        className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-4 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)] leading-relaxed font-mono text-sm"
                        placeholder={section.type === 'features' 
                          ? 'Paragraph 1 here\n\nParagraph 2 here\n\nParagraph 3 here\n\nLast line (will be italic)' 
                          : 'Enter section content...'}
                      />
                      {section.type === 'features' && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          Tip: Last paragraph will automatically appear in italic. Leave blank lines between paragraphs.
                        </p>
                      )}
                    </div>
                  )}

                  {/* CTA - for text, gallery, philosophy only (NOT hero) */}
                  {['text', 'gallery', 'philosophy'].includes(section.type) && (
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
                          placeholder="/contact or https://..."
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

                  {/* Edit images for Gallery section */}
                  {section.type === 'gallery' && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                      <h4 className="text-xs uppercase tracking-widest text-gray-600 mb-4">Instagram Gallery Images</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                          const imageUrl = section.images?.[idx] || '';
                          const isUploading = (section as any)[`_uploadingGalleryImage${idx}`];
                          
                          return (
                            <div key={idx} className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                              <div className="relative aspect-square bg-gray-200 border-2 border-dashed border-gray-300 hover:border-blue-400 transition cursor-pointer">
                                {imageUrl ? (
                                  <>
                                    <Image src={imageUrl} alt={`Gallery Image ${idx + 1}`} fill className="object-cover" unoptimized />
                                    {isUploading && (
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                      <Upload className="mx-auto mb-1 text-gray-400" size={24} />
                                      <span className="text-[9px] text-gray-500">Image {idx + 1}</span>
                                    </div>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleGalleryImageUpload(e, index, idx)}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  disabled={isUploading}
                                />
                              </div>
                              <div className="p-2 text-center">
                                <span className="text-[10px] text-gray-600 uppercase tracking-wide">Image {idx + 1}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-blue-600 mt-3">
                        💡 Click on any image to upload/replace. Recommended size: 750x750px (square)
                      </p>
                    </div>
                  )}

                  {/* Edit items for Philosophy section */}
                  {section.type === 'philosophy' && section.items && section.items.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                      <h4 className="text-xs uppercase tracking-widest text-gray-600 mb-4">Philosophy Content</h4>
                      <div className="space-y-5">
                        {/* Philosophy Part 1 - items[0] */}
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-blue-600 mb-2">Philosophy Paragraph 1</label>
                          <textarea
                            value={section.items[0]?.description || ''}
                            onChange={(e) => handleItemChange(index, 0, 'description', e.target.value)}
                            rows={4}
                            className="w-full bg-white border border-gray-300 p-3 text-sm focus:outline-none focus:border-blue-400 rounded leading-relaxed"
                            placeholder="First philosophy paragraph..."
                          />
                        </div>

                        {/* Philosophy Part 2 - items[1] */}
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-blue-600 mb-2">Philosophy Paragraph 2</label>
                          <textarea
                            value={section.items[1]?.description || ''}
                            onChange={(e) => handleItemChange(index, 1, 'description', e.target.value)}
                            rows={4}
                            className="w-full bg-white border border-gray-300 p-3 text-sm focus:outline-none focus:border-blue-400 rounded leading-relaxed"
                            placeholder="Second philosophy paragraph..."
                          />
                        </div>

                        <div className="border-t border-gray-300 my-4 pt-4">
                          <h5 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Art & Culture Section</h5>
                          
                          {/* Art Title - items[2] */}
                          <div className="mb-4">
                            <label className="block text-[10px] uppercase tracking-widest text-purple-600 mb-2">Art & Culture Title</label>
                            <input
                              type="text"
                              value={section.items[2]?.description || ''}
                              onChange={(e) => handleItemChange(index, 2, 'description', e.target.value)}
                              className="w-full bg-white border border-gray-300 p-2 text-sm focus:outline-none focus:border-purple-400 rounded"
                              placeholder="ART & Culture"
                            />
                          </div>

                          {/* Art Part 1 - items[3] */}
                          <div className="mb-4">
                            <label className="block text-[10px] uppercase tracking-widest text-purple-600 mb-2">Art Paragraph 1</label>
                            <textarea
                              value={section.items[3]?.description || ''}
                              onChange={(e) => handleItemChange(index, 3, 'description', e.target.value)}
                              rows={3}
                              className="w-full bg-white border border-gray-300 p-3 text-sm focus:outline-none focus:border-purple-400 rounded leading-relaxed"
                              placeholder="First art paragraph..."
                            />
                          </div>

                          {/* Art Part 2 - items[4] */}
                          <div className="mb-4">
                            <label className="block text-[10px] uppercase tracking-widest text-purple-600 mb-2">Art Paragraph 2</label>
                            <textarea
                              value={section.items[4]?.description || ''}
                              onChange={(e) => handleItemChange(index, 4, 'description', e.target.value)}
                              rows={3}
                              className="w-full bg-white border border-gray-300 p-3 text-sm focus:outline-none focus:border-purple-400 rounded leading-relaxed"
                              placeholder="Second art paragraph..."
                            />
                          </div>

                          {/* Art Part 3 - items[5] */}
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-purple-600 mb-2">Art Paragraph 3</label>
                            <textarea
                              value={section.items[5]?.description || ''}
                              onChange={(e) => handleItemChange(index, 5, 'description', e.target.value)}
                              rows={3}
                              className="w-full bg-white border border-gray-300 p-3 text-sm focus:outline-none focus:border-purple-400 rounded leading-relaxed"
                              placeholder="Third art paragraph..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Philosophy Images */}
                      <div className="border-t border-gray-300 mt-5 pt-5">
                        <h5 className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">Background Images</h5>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Texture Image - images[0] */}
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-green-600 mb-2">Texture Background</label>
                            <div className="relative aspect-[4/3] bg-gray-200 rounded overflow-hidden border-2 border-dashed border-gray-300 hover:border-green-400 transition cursor-pointer">
                              {section.images?.[0] ? (
                                <>
                                  <Image src={section.images[0]} alt="Texture Background" fill className="object-cover" unoptimized />
                                  {(section as any)._uploadingImage0 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <Upload className="mx-auto mb-1 text-gray-400" size={24} />
                                    <span className="text-[9px] text-gray-500">Philosophy BG</span>
                                  </div>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhilosophyImageUpload(e, index, 0)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={(section as any)._uploadingImage0}
                              />
                            </div>
                          </div>

                          {/* Art Image - images[1] */}
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-green-600 mb-2">Art Section Image</label>
                            <div className="relative aspect-[4/3] bg-gray-200 rounded overflow-hidden border-2 border-dashed border-gray-300 hover:border-green-400 transition cursor-pointer">
                              {section.images?.[1] ? (
                                <>
                                  <Image src={section.images[1]} alt="Art Section Image" fill className="object-cover" unoptimized />
                                  {(section as any)._uploadingImage1 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <Upload className="mx-auto mb-1 text-gray-400" size={24} />
                                    <span className="text-[9px] text-gray-500">Art Image</span>
                                  </div>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhilosophyImageUpload(e, index, 1)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={(section as any)._uploadingImage1}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display items for Features/Venue Grid section */}
                  {section.type === 'features' && section.items && section.items.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                      <h4 className="text-xs uppercase tracking-widest text-gray-600 mb-4">Venue Cards ({section.items.length})</h4>
                      <div className="space-y-6">
                        {section.items.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white border border-gray-300 p-4 rounded shadow-sm">
                            <div className="flex gap-4">
                              {/* Image Upload */}
                              <div className="flex-shrink-0" style={{ width: '120px' }}>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-600 mb-2">Image</label>
                                <div className="relative aspect-video bg-gray-200 rounded overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition cursor-pointer">
                                  {item.image ? (
                                    <>
                                      <Image src={item.image} alt={item.name || `Card ${idx + 1}`} fill className="object-cover" unoptimized />
                                      {item._uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Upload className="text-gray-400" size={20} />
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleItemImageUpload(e, index, idx)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={item._uploading}
                                  />
                                </div>
                              </div>

                              {/* Text Fields */}
                              <div className="flex-1 space-y-3">
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-gray-600 mb-1">Title</label>
                                  <input
                                    type="text"
                                    value={item.name || ''}
                                    onChange={(e) => handleItemChange(index, idx, 'name', e.target.value)}
                                    className="w-full bg-white border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-400 rounded"
                                    placeholder="Venue title"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-gray-600 mb-1">Description</label>
                                  <textarea
                                    value={item.description || ''}
                                    onChange={(e) => handleItemChange(index, idx, 'description', e.target.value)}
                                    rows={4}
                                    className="w-full bg-white border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-400 rounded"
                                    placeholder="Short description"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-gray-600 mb-1">Link (Optional)</label>
                                  <input
                                    type="text"
                                    value={item.link || ''}
                                    onChange={(e) => handleItemChange(index, idx, 'link', e.target.value)}
                                    className="w-full bg-white border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-400 rounded"
                                    placeholder="/page or https://..."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructions based on type */}
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-800">
                    {section.type === 'hero' && '⭐ Hero: 1 image, heading, subheading only (no button)'}
                    {section.type === 'features' && '🏢 Venue Grid: Upper heading (caps), heading, 4 paragraphs (last is italic) - Venue cards shown above'}
                    {section.type === 'parallax' && '🖼️ Parallax: 1 background image, heading, content text'}
                    {section.type === 'text' && '📝 Text Block: Heading, content with optional CTA button'}
                    {section.type === 'philosophy' && '🎨 Philosophy: Heading (caps), 2 philosophy paragraphs, Art title + 3 paragraphs, CTA button'}
                    {section.type === 'gallery' && '📸 Instagram Gallery: Heading, subheading, Instagram link, 6 gallery images'}
                    {section.type === 'menu' && '🍽️ Menu: Items managed via seed file'}
                  </div>
                </div>
              </div>
            </div>
          );
          })}
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
    </>
  );
}