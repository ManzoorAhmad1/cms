# CMS Content Formatting Guide

## 🏢 Venue Grid Section (Features)

### Layout Structure:
```
┌─────────────────────────────────────────────────┐
│  A YEEELS GROUP DESTINATION — PARIS | ...      │  ← Subheading (ALL CAPS)
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  WHERE PARISIAN CRAFT MEETS NEW YORK SOUL       │  ← Heading (ALL CAPS)
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Paragraph 1: Verde NYC is the latest jewel... │  ← Regular text
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Paragraph 2: Verde brings Parisian soul...    │  ← Regular text
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Paragraph 3: Step into a world of intimate... │  ← Regular text
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Paris on the plate. New York in the room       │  ← Last line (ITALIC)
└─────────────────────────────────────────────────┘

[VENUE CARDS GRID - 4 cards with images]
```

---

## 📝 How to Edit in CMS:

### Step 1: Open CMS
- Go to: http://localhost:3001
- Click "Home Page" → Edit

### Step 2: Find Venue Grid Section
- Look for section with type: **"Venue Grid (Features)"**

### Step 3: Edit Fields

#### **Subheading** field:
```
A YEEELS GROUP DESTINATION — PARIS | SAINT-TROPEZ | DUBAI | SARDINIA | NEW YORK
```
- Keep it ALL CAPS
- Use | (pipe) between locations

#### **Heading** field:
```
WHERE PARISIAN CRAFT MEETS NEW YORK SOUL
```
- Keep it ALL CAPS

#### **Content** field (IMPORTANT!):
```
Verde NYC is the latest jewel in the Yeeels Group crown—an international hospitality collective celebrated for curating unforgettable culinary destinations across Europe, the Middle East, and now, in the heart of Manhattan.

Verde brings Parisian soul to New York's vibrant streets. Here, French culinary tradition is reimagined with contemporary elegance—each dish reflects precision, passion, and the art of celebration.

Step into a world of intimate charm and metropolitan energy, where every moment is crafted for connection and savor. From thoughtfully designed tasting journeys to vibrant lounge evenings and exclusive dining experiences, Verde invites you to dine beyond the expected.

Paris on the plate. New York in the room
```

**⚠️ CRITICAL FORMATTING RULES:**

1. **Each paragraph on its own line**
2. **Leave ONE BLANK LINE between paragraphs** (press Enter twice)
3. **Last line will automatically be italic**
4. **Do NOT add extra spaces at the start/end**

---

## ✅ Correct Format Example:

```
Paragraph 1 text here...
[BLANK LINE]
Paragraph 2 text here...
[BLANK LINE]
Paragraph 3 text here...
[BLANK LINE]
Last line text here (will be italic)
```

---

## ❌ Wrong Format (Will Break Layout):

```
Paragraph 1 text here... Paragraph 2 text here... Paragraph 3 text here...
```
☝️ This will show as ONE paragraph!

```
Paragraph 1 text here...


Paragraph 2 text here...
```
☝️ Too many blank lines!

---

## 🎯 Quick Tips:

1. **Copy from seed file** - `verdey_backend/seed_home.js` has perfect formatting
2. **Use monospace font** - CMS textarea shows `font-mono` to see line breaks
3. **Count paragraphs** - Should have 4 paragraphs total
4. **Last line italic** - Happens automatically, no need to mark it
5. **Preview** - Save and check frontend to verify layout

---

## 🔄 If Layout Breaks:

1. Open `verdey_backend/seed_home.js`
2. Find Section 2 (Venue Grid)
3. Copy the `content` value exactly as shown
4. Paste in CMS Content field
5. Save
6. Refresh frontend

---

## 📸 Expected Result:

- Top: Small caps subtitle
- Below: Large heading
- Below: 3 regular paragraphs with spacing
- Bottom: 1 italic line
- Grid: 4 venue cards

---

## 🛠️ Advanced: Editing via Seed File

If you want complete control, edit directly in seed file:

```javascript
// File: verdey_backend/seed_home.js
{
  type: 'features',
  heading: 'WHERE PARISIAN CRAFT MEETS NEW YORK SOUL',
  subheading: 'A YEEELS GROUP DESTINATION — PARIS | ...',
  content: `First paragraph here.

Second paragraph here.

Third paragraph here.

Last italic line here`,
  // ... rest of section
}
```

Then run:
```bash
cd verdey_backend
node seed_home.js
```

---

## 📞 Need Help?

- CMS Guide: `/verdey_cms/CMS_USAGE_GUIDE.md`
- Seed File: `/verdey_backend/seed_home.js` (Section 2)
- Component: `/verde_nyc3/src/components/VenueGrid.tsx`
