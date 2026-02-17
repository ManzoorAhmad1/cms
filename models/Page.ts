// @ts-nocheck
import mongoose, { Schema, Model } from "mongoose";

export interface IPage extends mongoose.Document {
  slug: string; // e.g., 'home', 'about', 'contact'
  title: string;
  sections: Array<{
    type: 'hero' | 'gallery' | 'text' | 'features' | 'philosophy' | 'menu' | 'contact_info' | 'parallax';
    heading?: string;
    subheading?: string;
    content?: string;
    images?: string[]; 
    ctaLink?: string;
    ctaText?: string;
    order: number;
    styles?: any;
    items?: Array<{ name: string; description: string; price?: string }>; // For menu items
  }>;
}

const PageSchema: Schema<IPage> = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  sections: [
    {
      type: { type: String, enum: ['hero', 'gallery', 'text', 'features', 'philosophy', 'menu', 'contact_info', 'parallax'], default: 'text' },
      heading: { type: String },
      subheading: { type: String },
      content: { type: String },
      images: [{ type: String }],
      ctaLink: { type: String },
      ctaText: { type: String },
      order: { type: Number, default: 0 },
      styles: { type: Schema.Types.Mixed },
      items: [{
        name: String,
        description: String,
        price: String
      }]
    },
  ],
}, { timestamps: true });

// Prevent overwrite model error in dev mode
const PageModel: Model<IPage> = mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);

export default PageModel;
