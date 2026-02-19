# Verde NYC CMS - Usage Guide

## 📋 Section Types Overview

### 1. **Hero Section** (`type: 'hero'`)
**Purpose:** Main landing banner with call-to-action

**CMS Fields:**
- ✅ **Image Upload** - Large background image
- ✅ **Heading** - Main title
- ✅ **Subheading** - Subtitle text
- ✅ **CTA Link** - Button URL
- ✅ **CTA Text** - Button label

**Example:**
```javascript
{
  type: 'hero',
  heading: 'VERDE NYC',
  subheading: 'MediterrAsian Rooftop Restaurant & Lounge',
  ctaText: 'RESERVE YOUR TABLE',
  ctaLink: 'https://reservations.com',
  images: ['hero-image.jpg']
}
```

---

### 2. **Venue Grid / Features** (`type: 'features'`)
**Purpose:** Display multiple venue cards with images

**CMS Fields:**
- ✅ **Texture Background** - Background texture image
- ✅ **Heading** - Main title
- ✅ **Subheading** - Top subtitle
- ✅ **Content** - Paragraphs (separate with blank lines)

**⚠️ Venue Cards Management:**
Venue cards are managed in `seed_home.js`:
```javascript
items: [
  {
    name: 'VERDE RESTAURANT',
    description: 'The distinctively curated rooftop...',
    image: 'https://...venue-image.jpg',
    link: '/restaurant'
  },
  // Add more venue cards here
]
```

---

### 3. **Parallax Section** (`type: 'parallax'`)
**Purpose:** Scrolling background with overlay text

**CMS Fields:**
- ✅ **Image Upload** - Large parallax background
- ✅ **Heading** - Title
- ✅ **Content** - Description text

**Example:**
```javascript
{
  type: 'parallax',
  heading: 'Inspired by nature',
  content: 'MILA embodies a multi-sensory culinary...',
  images: ['parallax-bg.jpg']
}
```

---

### 4. **Text Block** (`type: 'text'`)
**Purpose:** Simple text content with optional CTA

**CMS Fields:**
- ✅ **Heading** - Section title
- ✅ **Content** - Main text
- ✅ **CTA Link** - Optional button URL
- ✅ **CTA Text** - Optional button label

**Example:**
```javascript
{
  type: 'text',
  heading: 'A Global Legacy of Culinary Excellence',
  content: 'The Yeeels Group has spent over a decade...',
  ctaText: 'RESERVE YOUR EXPERIENCE',
  ctaLink: '/reserve'
}
```

---

### 5. **Philosophy Detail** (`type: 'philosophy'`)
**Purpose:** Complex section with multiple text parts + Art & Culture

**CMS Fields:**
- ✅ **Heading** - Main title (e.g., "Our Philosophy")
- ✅ **Background Texture** - First image upload
- ⚠️ **Art Image** - Managed in seed file (2nd image)

**⚠️ Content Parts Management:**
Text parts are managed in `seed_home.js`:
```javascript
items: [
  { name: 'Philosophy Part 1', description: 'The Yeeels Group was founded...' },
  { name: 'Philosophy Part 2', description: 'Our three pillars...' },
  { name: 'Art & Culture Title', description: 'ART & Culture' },
  { name: 'Art & Culture Part 1', description: 'The Yeeels Group has always...' },
  { name: 'Art & Culture Part 2', description: 'At Verde NYC...' },
  { name: 'Art & Culture Part 3', description: 'For collaboration inquiries...' }
]
```

---

### 6. **Instagram Gallery** (`type: 'gallery'`)
**Purpose:** Display Instagram photos

**CMS Fields:**
- ✅ **Heading** - Section title
- ✅ **Subheading** - Instagram handle (e.g., @VERDE_NYC)
- ✅ **CTA Link** - Instagram profile URL

**⚠️ Images Management:**
Gallery images are managed in `seed_home.js`:
```javascript
images: [
  'https://...image1.jpg',
  'https://...image2.jpg',
  'https://...image3.jpg',
  'https://...image4.jpg',
  'https://...image5.jpg',
  'https://...image6.jpg'
]
```

---

## 🔧 How to Edit Complex Sections

### Editing Venue Cards

1. Open `verdey_backend/seed_home.js`
2. Find the `features` section
3. Modify the `items` array:
   ```javascript
   items: [
     {
       name: 'NEW VENUE',
       description: 'Your venue description here...',
       image: 'https://s3.../your-image.jpg',
       link: '/your-page'
     }
   ]
   ```
4. Run: `cd verdey_backend && node seed_home.js`
5. Refresh frontend

### Editing Instagram Gallery

1. Open `verdey_backend/seed_home.js`
2. Find the `gallery` section
3. Update `images` array with new URLs
4. Run: `cd verdey_backend && node seed_home.js`
5. Refresh frontend

### Editing Philosophy Content

1. Open `verdey_backend/seed_home.js`
2. Find the `philosophy` section
3. Update `items` array descriptions
4. Run: `cd verdey_backend && node seed_home.js`
5. Refresh frontend

---

## 💡 Layout Tips

### Text Formatting
- **Paragraphs:** Separate with blank lines in content field
- **Italics:** Use last paragraph for italic styling (Venue Grid)
- **Long Text:** Use textarea for multi-paragraph content

### Image Best Practices
- **Hero:** 1920x1080px minimum
- **Parallax:** 1920x1200px (tall for scrolling effect)
- **Venue Cards:** 800x450px (16:9 ratio)
- **Instagram:** 750x750px (square)
- **Texture:** 1920x1080px (low opacity)

### Content Length
- **Hero Heading:** 2-5 words
- **Hero Subheading:** 5-10 words
- **Paragraphs:** 150-300 characters ideal
- **Venue Descriptions:** 100-150 characters

---

## 🚀 Quick Start Workflow

1. **Open CMS:** http://localhost:3001
2. **Edit Home Page:** Click "Home Page" → Edit
3. **Modify Simple Sections:** 
   - Hero: Upload image, change text, update CTA
   - Parallax: Upload image, change heading/content
   - Text: Update heading, content, CTA
4. **For Complex Sections:**
   - Edit `verdey_backend/seed_home.js`
   - Run `node seed_home.js`
   - Refresh frontend
5. **Save Changes:** Click "Save Changes" button

---

## ⚠️ Important Notes

- **Image Upload:** Only works for Hero, Parallax, Features background
- **Venue Cards:** Must edit via seed file (not in CMS UI yet)
- **Instagram Images:** Must update via seed file
- **Content Updates:** Instant via CMS
- **Seed Changes:** Require re-running seed script

---

## 🔄 Update Process

```bash
# Terminal 1 - Backend (keep running)
cd verdey_backend
npm start

# Terminal 2 - Frontend (keep running)
cd verde_nyc3
npm run dev

# Terminal 3 - CMS (keep running)
cd verdey_cms
npm run dev

# Terminal 4 - When updating seed data
cd verdey_backend
node seed_home.js
```

---

## 📞 Need Help?

- Complex sections require seed file editing
- Simple text/image changes use CMS directly
- Always refresh frontend after seed updates
- Check browser console for errors
