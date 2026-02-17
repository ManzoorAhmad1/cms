import Image from "next/image";
import { Edit, Image as ImageIcon, Type, Trash2 } from "lucide-react";

interface SectionCardProps {
  section: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SectionCard({ section, index, onEdit, onDelete }: SectionCardProps) {
  return (
    <div 
      className="bg-white border border-[#e5e0d8] shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden h-64 flex flex-col"
      onClick={onEdit}
    >
      {/* Header / Type Badge */}
      <div className="absolute top-2 left-2 z-10 bg-[var(--verde-heading)] text-[#f3ede2] text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm shadow-sm">
        {section.type} Section
      </div>

       {/* Delete Button */}
       <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 z-20 text-white bg-red-500/80 p-1.5 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>

      {/* Preview Content */}
      <div className="flex-1 relative bg-[#faf9f6] flex items-center justify-center">
        {section.images && section.images.length > 0 ? (
          <Image 
            src={section.images[0]} 
            alt="Section Preview" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : section.image ? (
             <Image 
            src={section.image} 
            alt="Section Preview" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="text-[#dcd6cc] flex flex-col items-center gap-2 p-6 text-center">
            {section.type === 'text' ? <Type size={32} /> : <ImageIcon size={32} />}
            <span className="text-[10px] uppercase tracking-widest">
              {section.heading || "No Content Preview"}
            </span>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="bg-white/90 text-[var(--verde-heading)] px-4 py-2 rounded-full uppercase text-xs tracking-widest translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg flex items-center gap-2">
            <Edit size={12} /> Edit
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-white border-t border-[#f3ede2]">
        <h4 className="font-bold text-sm text-[var(--verde-heading)] truncate mb-1">
          {section.heading || `Section ${index + 1}`}
        </h4>
        <p className="text-xs text-[#999] truncate">
          {section.subheading || section.content?.substring(0, 30) || "No description"}
        </p>
      </div>
    </div>
  );
}