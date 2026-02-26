"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Save, Upload } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { getBackendUrl, getAuthHeaders, getAuthToken } from "@/lib/auth";

// @ts-ignore
export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: pageSlug } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const [activeMenuTab, setActiveMenuTab] = useState(0); // For CMS menu tab navigation
  const [editMode, setEditMode] = useState<{[key: number]: 'preview' | 'html'}>({});

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`${getBackendUrl()}/pages/${pageSlug}`);
        if (!res.ok) throw new Error("Failed to fetch page");
        const data = await res.json();
        
        if (data.page) {
          setId(data.page._id);
          setTitle(data.page.title);
          setSlug(data.page.slug);
          setSeoTitle(data.page.seoTitle || '');
          setSeoDescription(data.page.seoDescription || '');
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

  // After data loads, parse HTML content of menu sections into simple _items
  useEffect(() => {
    if (!loading) {
      setSections(prev => prev.map(section => {
        if (section.type === 'menu' && section.content && !section._items) {
          return { ...section, _items: parseHTMLToItems(section.content) };
        }
        return section;
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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

  // Parse HTML content into _items array for menu sections
  // Simple sections (h3, hr, div.menu-items, p) → editable rows
  // Complex divs (cocktail-grid, dessert-grid, menu-experiences, etc.) → locked 'html' block (preserved as-is)
  const parseHTMLToItems = (htmlContent: string): any[] => {
    if (!htmlContent || typeof document === 'undefined') return [];
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    const result: any[] = [];
    div.childNodes.forEach((node: any) => {
      if (!node.tagName) return; // skip text/comment nodes
      const tag = node.tagName;
      const cls = node.className || '';
      if (tag === 'H2') {
        const text = node.textContent?.trim() || '';
        if (text) result.push({ type: 'h2', name: text });
      } else if (tag === 'H3') {
        const text = node.textContent?.trim() || '';
        if (text) result.push({ type: 'heading', name: text });
      } else if (tag === 'HR') {
        result.push({ type: 'divider', name: '' });
      } else if (tag === 'DIV' && cls === 'menu-items') {
        // Simple list — each <p> becomes an editable item
        node.querySelectorAll('p').forEach((p: any) => {
          const text = p.innerHTML?.trim(); // keep inner HTML (bold, br tags)
          if (text) result.push({ type: 'item', name: text });
        });
      } else if (tag === 'DIV') {
        // Complex layout div (cocktail-grid, dessert-grid, menu-experiences, etc.)
        // Preserve it exactly as-is — locked, not editable
        result.push({ type: 'html', name: node.outerHTML });
      } else if (tag === 'P') {
        const text = node.innerHTML?.trim();
        if (text) result.push({ type: 'item', name: text });
      }
    });
    return result;
  };

  // Convert _items back to HTML before saving — layout is PRESERVED
  const convertItemsToHTML = (items: any[]): string => {
    let html = '';
    let inMenuDiv = false;
    items.forEach(item => {
      if (item.type === 'h2') {
        if (inMenuDiv) { html += '</div>\n'; inMenuDiv = false; }
        html += `<h2><strong>${item.name}</strong></h2>\n`;
      } else if (item.type === 'heading') {
        if (inMenuDiv) { html += '</div>\n'; inMenuDiv = false; }
        html += `<h3><strong>${item.name}</strong></h3>\n`;
      } else if (item.type === 'item') {
        if (!inMenuDiv) { html += '<div class="menu-items">\n'; inMenuDiv = true; }
        html += `  <p>${item.name}</p>\n`;
      } else if (item.type === 'divider') {
        if (inMenuDiv) { html += '</div>\n'; inMenuDiv = false; }
        html += '<hr class="menu-divider" />\n';
      } else if (item.type === 'html') {
        // Complex block — output exactly as stored, no modifications
        if (inMenuDiv) { html += '</div>\n'; inMenuDiv = false; }
        html += item.name + '\n';
      }
    });
    if (inMenuDiv) html += '</div>\n';
    return html;
  };

  // Handle change to a menu _items entry
  const handleMenuItemChange = (sectionIndex: number, itemIndex: number, value: string) => {
    setSections(prev => {
      const next = [...prev];
      const _items = [...(next[sectionIndex]._items || [])];
      _items[itemIndex] = { ..._items[itemIndex], name: value };
      next[sectionIndex] = { ...next[sectionIndex], _items };
      return next;
    });
  };

  const handleAddMenuItem = (sectionIndex: number, type: 'heading' | 'item' | 'divider') => {
    setSections(prev => {
      const next = [...prev];
      const _items = [...(next[sectionIndex]._items || []), { type, name: '' }];
      next[sectionIndex] = { ...next[sectionIndex], _items };
      return next;
    });
  };

  const handleRemoveMenuItem = (sectionIndex: number, itemIndex: number) => {
    setSections(prev => {
      const next = [...prev];
      const _items = (next[sectionIndex]._items || []).filter((_: any, i: number) => i !== itemIndex);
      next[sectionIndex] = { ...next[sectionIndex], _items };
      return next;
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

    try {
      const token = getAuthToken();
      const response = await fetch(`${getBackendUrl()}/upload`, {
        method: "POST",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
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

    try {
      const token = getAuthToken();
      const response = await fetch(`${getBackendUrl()}/upload`, {
        method: "POST",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
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

  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number, imageIndex: number) => {
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
        [`_uploadingMenuImage${imageIndex}`]: true 
      };
      return newSections;
    });

    setSaving(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = getAuthToken();
      const response = await fetch(`${getBackendUrl()}/upload`, {
        method: "POST",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
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
            [`_uploadingMenuImage${imageIndex}`]: false 
          };
          return newSections;
        });
        const label = imageIndex === 0 ? 'Cover' : `Page ${imageIndex}`;
        toast.success(`Menu ${label} uploaded`);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Menu image upload failed");
      URL.revokeObjectURL(localPreviewUrl);
      setSections(prevSections => {
        const newSections = [...prevSections];
        const images = [...(newSections[sectionIndex].images || [])];
        images[imageIndex] = '';
        newSections[sectionIndex] = { 
          ...newSections[sectionIndex], 
          images,
          [`_uploadingMenuImage${imageIndex}`]: false 
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

    try {
      const token = getAuthToken();
      const response = await fetch(`${getBackendUrl()}/upload`, {
        method: "POST",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
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

    try {
      const token = getAuthToken();
      const response = await fetch(`${getBackendUrl()}/upload`, {
        method: "POST",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
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

    // Strip ALL client-only (_-prefixed) fields recursively before saving
    const stripClientFields = (obj: any): any => {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
      const result: any = {};
      for (const key of Object.keys(obj)) {
        if (key.startsWith('_')) continue; // skip _uploading, _uploadingImage0, _uploadingGalleryImage*, etc.
        if (key === 'items' && Array.isArray(obj[key])) {
          result[key] = obj[key].map((item: any) => stripClientFields(item));
        } else {
          result[key] = obj[key];
        }
      }
      return result;
    };

    try {
      // For menu sections: convert _items → HTML, strip client-only fields
      const sectionsToSave = sections.map(section => {
        if (section.type === 'menu') {
          const { _items, ...rest } = section;
          const cleaned = stripClientFields(rest);
          if (_items && _items.length > 0) {
            return { ...cleaned, content: convertItemsToHTML(_items) };
          }
          return cleaned;
        }
        return stripClientFields(section);
      });

      const token = getAuthToken();
      const res = await fetch(`${getBackendUrl()}/pages/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title, slug, seoTitle, seoDescription, sections: sectionsToSave }),
      });

      if (res.ok) {
        toast.success("Page Updated Successfully!");
        // Stay on same page after saving
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto min-h-screen pb-32">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link 
          href="/"
          className="flex items-center gap-2 text-[var(--verde-text)] hover:text-[var(--verde-accent)] transition-colors text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Pages
        </Link>
        <h1 className="text-base sm:text-xl lg:text-2xl font-light text-[var(--verde-heading)] uppercase tracking-wider">
          Edit: <span className="font-medium">{title}</span>
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

        {/* SEO Metadata */}
        <div className="bg-white p-6 border border-[#e5e0d8] shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--verde-heading)] mb-6 border-b border-[#f3ede2] pb-2">
            🔍 SEO Metadata
          </h2>
          <p className="text-[11px] text-gray-500 mb-4">
            These fields control how your page appears in search engine results (Google, Bing, etc.)
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                SEO Title <span className="text-[10px] text-gray-400 normal-case">(appears in browser tab & search results)</span>
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                placeholder="e.g., Verde NYC - Mediterranean Restaurant in New York"
                maxLength={70}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                {seoTitle.length}/70 characters (recommended: 50-60)
              </p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                SEO Description <span className="text-[10px] text-gray-400 normal-case">(meta description for search engines)</span>
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)] leading-relaxed"
                placeholder="e.g., Experience authentic Mediterranean cuisine at Verde NYC. Award-winning dishes, craft cocktails, and elegant ambiance in the heart of New York City."
                rows={3}
                maxLength={160}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                {seoDescription.length}/160 characters (recommended: 150-160)
              </p>
            </div>
          </div>
          
          {/* SEO Preview */}
          {(seoTitle || seoDescription) && (
            <div className="mt-6 pt-4 border-t border-[#f3ede2]">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Search Result Preview</p>
              <div className="bg-white p-4 border border-gray-200 rounded max-w-xl">
                <p className="text-[#1a0dab] text-lg leading-tight hover:underline cursor-pointer truncate">
                  {seoTitle || title || 'Page Title'}
                </p>
                <p className="text-[#006621] text-sm mt-1">
                  verde-nyc.com/{slug || 'page-url'}
                </p>
                <p className="text-[#545454] text-sm mt-1 line-clamp-2">
                  {seoDescription || 'Add a meta description to improve your search visibility...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--verde-heading)]">
              Content Sections
            </h2>
          </div>

          {/* Render Non-Menu Sections First */}
          {sections.filter(s => s.type !== 'menu').map((section, originalIndex) => {
            // Get the actual index in the sections array
            const index = sections.findIndex((s, i) => i >= 0 && s === section);
            const needsImage = ['hero', 'parallax'].includes(section.type) || 
                              (section.type === 'text' && section.images && section.images.length > 0);
            const needsMultipleImages = ['gallery'].includes(section.type);
            
            return (
            <div key={index} className="bg-white p-6 border border-[#e5e0d8] relative shadow-sm group">
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
                  {section.type === 'menu-category' && '🍽️ Menu Category'}
                  {section.type === 'contact_info' && '📞 Contact Information'}
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
                            unoptimized
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
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] font-semibold">
                          Content
                          {section.type === 'features' && (
                            <span className="text-blue-600 font-normal ml-2 text-[10px]">
                              (Each paragraph on new line)
                            </span>
                          )}
                        </label>
                        {section.type !== 'features' && section.content && section.content.includes('<') && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditMode({...editMode, [index]: 'preview'})}
                              className={`px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                                (!editMode[index] || editMode[index] === 'preview')
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              👁️ Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditMode({...editMode, [index]: 'html'})}
                              className={`px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                                editMode[index] === 'html'
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              ⚙️ HTML
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Show preview if content has HTML and preview mode is active (not for features - always plain text) */}
                      {section.type !== 'features' && section.content && section.content.includes('<') && (!editMode[index] || editMode[index] === 'preview') ? (
                        <div className="space-y-3">
                          <div 
                            className="w-full bg-white border-2 border-blue-200 p-6 min-h-[200px] max-h-[400px] overflow-y-auto"
                            style={{ 
                              fontFamily: 'Georgia, serif',
                              fontSize: '14px',
                              lineHeight: '1.8'
                            }}
                            dangerouslySetInnerHTML={{ __html: section.content }}
                          />
                          <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            👁️ <strong>Preview Mode:</strong> Switch to HTML mode to edit.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
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
                    </div>
                  )}

                  {/* CTA - for text, gallery, philosophy only (NOT hero) */}
                  {['text', 'gallery', 'philosophy'].includes(section.type) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                          CTA Link {section.type === 'text' && <span className="text-[10px] text-gray-500 normal-case">(or Google Maps embed URL)</span>}
                        </label>
                        <input
                          type="text"
                          value={section.ctaLink || ''}
                          onChange={(e) => handleSectionChange(index, "ctaLink", e.target.value)}
                          className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                          placeholder={section.type === 'text' ? "/contact or https://maps.google.com/..." : "/contact or https://..."}
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                          CTA Text {section.type === 'text' && <span className="text-[10px] text-gray-500 normal-case">(optional)</span>}
                        </label>
                        <input
                          type="text"
                          value={section.ctaText || ''}
                          onChange={(e) => handleSectionChange(index, "ctaText", e.target.value)}
                          className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                          placeholder="Button Text (leave empty for map embed)"
                        />
                      </div>
                    </div>
                  )}

                  {/* Edit images for Gallery section */}
                  {section.type === 'gallery' && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                      <h4 className="text-xs uppercase tracking-widest text-gray-600 mb-4">Gallery Images</h4>
                      <p className="text-[10px] text-gray-600 mb-4">
                        Upload images for gallery. For Instagram section (home page), use first 6 images.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {Array.from({ length: 30 }).map((_, idx) => {
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
                                      <Upload className="mx-auto mb-1 text-gray-400" size={20} />
                                      <span className="text-[9px] text-gray-500">{idx + 1}</span>
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
                              <div className="p-1 text-center">
                                <span className="text-[9px] text-gray-600 uppercase tracking-wide">#{idx + 1}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-blue-600 mt-3">
                        💡 Click on any image to upload/replace. Recommended: 750x750px (square) or larger.
                      </p>
                    </div>
                  )}

                  {/* Edit Menu Category section */}
                  {section.type === 'menu-category' && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                      <h4 className="text-xs uppercase tracking-widest text-gray-600 mb-4">Menu Category Images</h4>
                      <p className="text-[10px] text-gray-600 mb-4">
                        First image is the cover, remaining images are menu pages shown in the carousel.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => {
                          const imageUrl = section.images?.[idx] || '';
                          const isUploading = (section as any) [`_uploadingMenuImage${idx}`];
                          const isCover = idx === 0;
                          
                          return (
                            <div key={idx} className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                              <div className="relative aspect-[3/4] bg-gray-200 border-2 border-dashed border-gray-300 hover:border-orange-400 transition cursor-pointer">
                                {imageUrl ? (
                                  <>
                                    <Image src={imageUrl} alt={`Menu ${isCover ? 'Cover' : `Page ${idx}`}`} fill className="object-cover" unoptimized />
                                    {isUploading && (
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                      <Upload className="mx-auto mb-1 text-gray-400" size={20} />
                                      <span className="text-[9px] text-gray-500">{isCover ? 'Cover' : `Page ${idx}`}</span>
                                    </div>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleMenuImageUpload(e, index, idx)}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  disabled={isUploading}
                                />
                              </div>
                              <div className="p-2 text-center bg-orange-50">
                                <span className="text-[10px] text-orange-700 uppercase tracking-wide font-semibold">
                                  {isCover ? '📋 Cover' : `📄 Page ${idx}`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-blue-600 mt-3">
                        💡 Upload cover image first, then add menu pages. Click any image to upload/replace.
                      </p>
                    </div>
                  )}

                  {/* Edit items for Contact Info section */}
                  {section.type === 'contact_info' && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                      <h4 className="text-xs uppercase tracking-widest text-gray-600 mb-4 flex items-center justify-between">
                        <span>Contact Information Items</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newSections = [...sections];
                            if (!newSections[index].items) newSections[index].items = [];
                            newSections[index].items.push({ name: '', description: '', link: '' });
                            setSections(newSections);
                          }}
                          className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          + Add Item
                        </button>
                      </h4>
                      <p className="text-[10px] text-gray-600 mb-4">
                        Add contact details like phone, email, address, social links etc. Use Name for label, Description for value, Link for URLs.
                      </p>
                      <div className="space-y-4">
                        {section.items?.map((item: any, itemIdx: number) => (
                          <div key={itemIdx} className="bg-white border border-gray-300 p-4 rounded relative">
                            <button
                              type="button"
                              onClick={() => {
                                const newSections = [...sections];
                                newSections[index].items = newSections[index].items?.filter((_: any, i: number) => i !== itemIdx);
                                setSections(newSections);
                              }}
                              className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                              title="Remove Item"
                            >
                              <Trash2 size={14} />
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-600 mb-1">
                                  Label/Name
                                </label>
                                <input
                                  type="text"
                                  value={item.name || ''}
                                  onChange={(e) => handleItemChange(index, itemIdx, 'name', e.target.value)}
                                  className="w-full bg-white border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-400 rounded"
                                  placeholder="e.g., Phone, Email, Address"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-600 mb-1">
                                  Value/Description
                                </label>
                                <input
                                  type="text"
                                  value={item.description || ''}
                                  onChange={(e) => handleItemChange(index, itemIdx, 'description', e.target.value)}
                                  className="w-full bg-white border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-400 rounded"
                                  placeholder="e.g., +1234567890, email@example.com"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-600 mb-1">
                                  Link (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.link || ''}
                                  onChange={(e) => handleItemChange(index, itemIdx, 'link', e.target.value)}
                                  className="w-full bg-white border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-400 rounded"
                                  placeholder="https://... or /page"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* Image Upload */}
                              <div className="flex-shrink-0 w-full sm:w-[120px]">
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
                    {section.type === 'text' && '📝 Text Block: Heading, subheading, content with optional CTA button OR Google Maps embed. Image upload shows only if section has an image in database.'}
                    {section.type === 'philosophy' && '🎨 Philosophy: Heading (caps), 2 philosophy paragraphs, Art title + 3 paragraphs, CTA button'}
                    {section.type === 'gallery' && '📸 Gallery: Heading, subheading, Instagram link, up to 30 images (use first 6 for Instagram section)'}
                    {section.type === 'menu' && '🍽️ Menu: Items managed via seed file'}
                    {section.type === 'menu-category' && '📋 Menu Category: Heading (category name), description, 1 cover image + up to 9 menu page images'}
                    {section.type === 'contact_info' && '📞 Contact Info: Add items with Name (label), Description (value), Link (optional URL). Use for phone, email, address, social links.'}
                  </div>
                </div>
              </div>
            </div>
          );
          })}

          {/* Menu Sections - Tabbed Interface */}
          {sections.filter(s => s.type === 'menu').length > 0 && (
            <div className="bg-white p-6 border-2 border-orange-300 relative shadow-sm">
              <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-4 rounded">
                <span className="text-sm uppercase tracking-widest text-orange-700 font-bold flex items-center gap-2">
                  🍽️ <span>Menu Categories</span>
                  <span className="text-xs bg-orange-200 px-2 py-1 rounded ml-auto">{sections.filter(s => s.type === 'menu').length} Tabs</span>
                </span>
              </div>

              {/* Tab Controls */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b-2 border-gray-200">
                {sections.filter(s => s.type === 'menu').map((menuSection, tabIndex) => (
                  <button
                    key={tabIndex}
                    type="button"
                    onClick={() => setActiveMenuTab(tabIndex)}
                    className={`px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-all border-b-4 whitespace-nowrap ${
                      activeMenuTab === tabIndex
                        ? 'border-orange-500 text-orange-700 bg-orange-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {menuSection.heading || `Tab ${tabIndex + 1}`}
                  </button>
                ))}
              </div>

              {/* Active Tab Content */}
              {sections.filter(s => s.type === 'menu').map((menuSection, tabIndex) => {
                if (activeMenuTab !== tabIndex) return null;
                const sectionIndex = sections.findIndex(s => s === menuSection);
                const _items: any[] = menuSection._items || [];

                return (
                  <div key={tabIndex} className="space-y-6">
                    {/* Tab Name */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2 font-semibold">
                        Tab Name (Menu Category)
                      </label>
                      <input
                        type="text"
                        value={menuSection.heading || ''}
                        onChange={(e) => handleSectionChange(sectionIndex, "heading", e.target.value)}
                        className="w-full bg-[#faf9f6] border-2 border-orange-200 p-3 focus:outline-none focus:border-orange-400 transition-colors text-[var(--verde-heading)] font-semibold"
                        placeholder="e.g., DINNER, COCKTAIL, WINE"
                      />
                    </div>

                    {/* Subheading */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                        Subheading
                      </label>
                      <input
                        type="text"
                        value={menuSection.subheading || ''}
                        onChange={(e) => handleSectionChange(sectionIndex, "subheading", e.target.value)}
                        className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                        placeholder="e.g., Menu"
                      />
                    </div>

                    {/* Menu Items - Simple Inputs */}
                    <div>
                      <div className="flex flex-wrap items-start sm:items-center gap-2 sm:gap-0 sm:justify-between mb-3">
                        <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] font-semibold">
                          Menu Items
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddMenuItem(sectionIndex, 'heading')}
                            className="px-3 py-1.5 text-xs uppercase tracking-wide bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 transition-colors"
                          >
                            + Section Heading
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddMenuItem(sectionIndex, 'item')}
                            className="px-3 py-1.5 text-xs uppercase tracking-wide bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 transition-colors"
                          >
                            + Menu Item
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddMenuItem(sectionIndex, 'divider')}
                            className="px-3 py-1.5 text-xs uppercase tracking-wide bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-colors"
                          >
                            + Divider
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                        {_items.length === 0 && (
                          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded">
                            <p className="text-sm">No items yet.</p>
                            <p className="text-xs mt-1">Use the buttons above to add section headings and menu items.</p>
                          </div>
                        )}

                        {_items.map((item: any, itemIdx: number) => (
                          <div key={itemIdx} className={`flex items-center gap-2 rounded ${
                            item.type === 'heading' || item.type === 'h2' ? 'bg-purple-50 border border-purple-200 p-2' :
                            item.type === 'divider' ? 'bg-gray-50 border border-gray-200 p-2' :
                            item.type === 'html' ? 'bg-yellow-50 border border-yellow-300 p-2' :
                            'bg-green-50 border border-green-200 p-2'
                          }`}>
                            <span className="text-[10px] text-gray-400 w-5 text-center flex-shrink-0">{itemIdx + 1}</span>

                            {(item.type === 'heading' || item.type === 'h2') && (
                              <input
                                type="text"
                                value={item.name || ''}
                                onChange={(e) => handleMenuItemChange(sectionIndex, itemIdx, e.target.value)}
                                className="flex-1 bg-white border border-purple-200 px-3 py-2 text-sm font-semibold uppercase tracking-wide focus:outline-none focus:border-purple-400 text-[var(--verde-heading)]"
                                placeholder="Section Heading (e.g., STARTERS, MAINS)"
                              />
                            )}

                            {item.type === 'item' && (
                              <input
                                type="text"
                                value={item.name || ''}
                                onChange={(e) => handleMenuItemChange(sectionIndex, itemIdx, e.target.value)}
                                className="flex-1 bg-white border border-green-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400 text-[var(--verde-heading)]"
                                placeholder="Item name, description $price  (e.g., Salmon Tartare, yuzu, avocado 24)"
                              />
                            )}

                            {item.type === 'divider' && (
                              <div className="flex-1 flex items-center gap-2 px-2">
                                <div className="flex-1 border-t border-dashed border-gray-400"></div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">divider line</span>
                                <div className="flex-1 border-t border-dashed border-gray-400"></div>
                              </div>
                            )}

                            {item.type === 'html' && (
                              <div className="flex-1 flex items-center gap-2 px-2">
                                <span className="text-[11px] text-yellow-700">🔒 Complex layout block — auto-preserved (layout safe)</span>
                              </div>
                            )}

                            <span className={`text-[9px] uppercase tracking-widest flex-shrink-0 w-14 text-center font-semibold ${
                              item.type === 'heading' || item.type === 'h2' ? 'text-purple-500' :
                              item.type === 'divider' ? 'text-gray-400' :
                              item.type === 'html' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {item.type === 'h2' ? 'heading' : item.type}
                            </span>

                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Download Link & Button Text */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                          Download Link (Optional)
                        </label>
                        <input
                          type="text"
                          value={menuSection.ctaLink || ''}
                          onChange={(e) => handleSectionChange(sectionIndex, "ctaLink", e.target.value)}
                          className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                          placeholder="/s/wine-menu.pdf"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[var(--verde-text)] mb-2">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={menuSection.ctaText || ''}
                          onChange={(e) => handleSectionChange(sectionIndex, "ctaText", e.target.value)}
                          className="w-full bg-[#faf9f6] border border-[#e5e0d8] p-3 focus:outline-none focus:border-[var(--verde-accent)] transition-colors text-[var(--verde-heading)]"
                          placeholder="download menu"
                        />
                      </div>
                    </div>

                    {/* Remove Tab */}
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(sectionIndex)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 text-xs uppercase tracking-widest"
                      >
                        <Trash2 size={14} /> Remove This Menu Tab
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-[#e5e0d8] p-3 sm:p-4 flex justify-end gap-3 sm:gap-4 shadow-lg z-40">
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