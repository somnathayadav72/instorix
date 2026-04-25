# Instorix Design System

A clean, Instagram-native design language for a media downloader. The aesthetic mirrors Instagram's own web UI — restrained whites, the iconic orange→pink→purple gradient, rounded geometry, and content-first layouts.

---

## 1. Visual Theme & Atmosphere

Instorix feels like a natural extension of Instagram. Users should feel immediately at home: the same gradient they see on IG's logo and stories ring appears throughout the UI. The design is **light, airy, and purposeful** — no dark modes, no heavy gradients wallpapering backgrounds, no noise. Every element earns its presence.

**Key Characteristics:**
- Instagram-brand gradient (`#F77737 → #E1306C → #833AB4`) used sparingly for accents and CTAs only
- Pure white (`#ffffff`) and near-white (`#fafafa`) surfaces — clean like Instagram's web
- Rounded corners (16px–24px) — friendly but not pill-extreme
- Single-column, centered layout (max-width ≈ 480px) matching Instagram's post width
- Typography: `Inter` (system/Google Fonts) — the same weight class Instagram uses
- Micro-interactions via Framer Motion — subtle, never distracting

---

## 2. Color Palette

### Brand Gradient
The Instagram gradient is the brand identity. Use it **only** on:
- Primary CTA buttons (Download HD)
- The logo/icon mark
- Type badges (Reel, Post, etc.)
- Avatar ring decoration

```
--color-insta-orange:  #F77737
--color-insta-pink:    #E1306C
--color-insta-purple:  #833AB4
--color-insta-yellow:  #FCAF45   /* stories ring accent */

/* Applied as Tailwind utility */
bg-gradient-to-r from-[#F77737] via-[#E1306C] to-[#833AB4]
```

### Neutrals
```
--page-bg:       #fafafa    /* body background — matches IG web */
--surface:       #ffffff    /* cards, inputs */
--border:        #e5e7eb    /* gray-200 — card & input borders */
--border-strong: #d1d5db    /* gray-300 — hover states */
--text-primary:  #111827    /* gray-900 — headings, usernames */
--text-body:     #374151    /* gray-700 — captions, body */
--text-muted:    #6b7280    /* gray-500 — timestamps, helper */
--text-faint:    #9ca3af    /* gray-400 — placeholders, "more" */
```

### Semantic
```
Success:  #22c55e  (green-500)  — pasted/valid state
Error:    #ef4444  (red-400)    — invalid URL, error message
```

---

## 3. Typography

**Font**: `Inter` (via system stack or Google Fonts import). This is what Instagram uses on web.

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

| Role | Size | Weight | Color |
|------|------|--------|-------|
| Page headline | 36–40px | 800 (extrabold) | gray-900 |
| Section heading | 24px | 700 | gray-900 |
| Username / label | 13px | 600 (semibold) | gray-900 |
| Body / caption | 13–14px | 400 | gray-700 |
| Small / meta | 11–12px | 400–600 | gray-400–500 |
| Button | 14–15px | 600 | white |
| Badge | 10–11px | 600 | white |

**Rules:**
- Never use font-weight below 400 in UI
- Headings use `tracking-tight` (letter-spacing: -0.025em)
- Body text is 13px (same as Instagram's caption size)
- Uppercase labels use `tracking-widest` at 10–12px

---

## 4. Border Radius Scale

Instorix uses a **consistent rounded-2xl system** — friendly but not pill-extreme.

| Component | Radius | Tailwind |
|-----------|--------|----------|
| Page card / main container | 24px | `rounded-3xl` |
| Input field | 16px | `rounded-2xl` |
| Buttons | 16px | `rounded-2xl` |
| Avatar | 100% | `rounded-full` |
| Type badge | 100% | `rounded-full` |
| Carousel dots | 100% | `rounded-full` |
| Recent history tiles | 16px | `rounded-2xl` |
| Skeleton loaders | 16px | `rounded-2xl` |

---

## 5. Component Specs

### Input Field
```
Height: 48px (h-12)
Background: #f9fafb (gray-50)
Border: 1px solid gray-200
Border-radius: 16px (rounded-2xl)
Padding: 0 90px 0 44px (icon left, actions right)
Font: 14px Inter 400
Placeholder color: gray-300

Focus state:
  border-color: rgba(225,48,108,0.6)  /* insta-pink at 60% */
  ring: 2px rgba(225,48,108,0.2)

Valid state:
  border-color: green-400
  ring: 2px green-200
  right icon: CheckCircle2 (green-500)

Error state:
  border-color: red-400
  ring: 2px red-200
  right icon: AlertCircle (red-400)
```

### Primary Button (Download HD)
```
Height: 48px (h-12)
Background: linear-gradient(to right, #F77737, #E1306C, #833AB4)
Text: white, 15px, semibold
Border-radius: 16px (rounded-2xl)
Shadow: shadow-md
Hover: opacity-95
Active: scale(0.98)
Disabled: opacity-50, cursor-not-allowed
```

### Secondary Button (All / View on IG)
```
Height: 44px (h-11)
Background: white
Border: 2px solid gray-200
Text: gray-700, 13px, semibold
Border-radius: 16px
Hover: border-gray-300, bg-gray-50
```

### Ghost Link (View on Instagram)
```
Height: 36px
Color: gray-400
Hover: gray-600
Font: 12px
Contains: ExternalLink icon (3.5 × 3.5)
```

### Paste Button (inline input)
```
Height: auto, padding: 6px 10px
Background: gray-100
Hover: gray-200
Text: gray-500, 11px semibold
Border-radius: 12px (rounded-xl)
Contains: ClipboardPaste or CheckCircle2 icon
```

---

## 6. MediaCard (the Instagram post viewer)

This is the core UI unit. It mirrors Instagram's post card exactly.

```
Max-width: 480px
Border: 1px solid gray-200
Border-radius: 24px (rounded-3xl)
Shadow: shadow-xl
Background: white
```

### Header strip
```
Height: auto, padding: 12px 16px
Contains:
  - Avatar (36px circle, gradient ring 2px from-[#F77737] to-[#833AB4])
  - @username (13px semibold gray-900)
  - Timestamp (11px gray-400)
  - Type badge (gradient pill, 10px white semibold)
Border-bottom: 1px solid gray-100
```

### Media viewer
```
Aspect ratio: 4/5 (portrait — same as Instagram's default)
Background: #000
object-fit: contain
Video: controlsList="nodownload", onContextMenu=prevent
Images: draggable=false
```

### Carousel controls
```
Arrows: 32px white/90 circle, shadow, abs positioned left/right center
Dots: 6px circles, white/50 inactive → white + 12px wide active
Position: bottom-3, centered
```

### Content area
```
Padding: 16px top, 16px sides, 16px bottom

Like count: Heart icon (fill #E1306C), 13px semibold gray-800
Caption: @author (semibold) + caption text, 13px, gray-700
"more/less" toggle: gray-400, 12px
```

---

## 7. Hero Section Layout

```
Background: #fafafa
Max-content-width: 480px (same as MediaCard)
Centered single column

Sections (top to bottom):
1. Logo mark — 56px square, rounded-2xl, gradient bg, white IG icon
2. Headline — 36–40px extrabold, tracking-tight
3. Subline — 15px gray-500
4. Input card — white, rounded-3xl, shadow-lg, p-5
   └─ URL input + Paste button
   └─ Error message (animated)
   └─ Submit button (gradient)
5. Loading skeleton (matches MediaCard proportions)
6. MediaCard result
7. Recent downloads strip (horizontal scroll)
```

---

## 8. Spacing System

Base unit: **4px**

| Token | Value | Tailwind |
|-------|-------|---------|
| xs | 4px | `p-1` |
| sm | 8px | `p-2` |
| md | 12px | `p-3` |
| lg | 16px | `p-4` |
| xl | 20px | `p-5` |
| 2xl | 24px | `p-6` |
| section | 40px | `mt-10` |

Sections within the hero use `mb-6` (24px) between blocks.

---

## 9. Animation

All animations via **Framer Motion**. Keep them fast and physical.

| Event | Animation |
|-------|-----------|
| Card appears | `y: 24 → 0`, `opacity: 0 → 1`, spring (stiffness 220, damping 22) |
| Hero elements | `y: 16 → 0`, `opacity: 0 → 1`, `delay: 0.1s` stagger |
| Error message | `height: 0 → auto` + `opacity: 0 → 1`, AnimatePresence |
| Button active | `scale(0.98)` |
| Recent tile hover | `scale-105` on inner image |

---

## 10. Do's and Don'ts

### Do
- Use the gradient **only** on CTAs, badges, logo, and avatar rings
- Keep page background `#fafafa`, card surface `#ffffff`
- Use `rounded-2xl` (16px) for inputs and buttons, `rounded-3xl` (24px) for cards
- Keep max content width at 480px — Instagram's post width
- Use 13px for captions/body — same as Instagram
- Disable browser video download: `controlsList="nodownload"` + prevent right-click
- Proxy all media through `/api/proxy?url=...&inline=true` to avoid Instagram hotlink blocks
- Use Framer Motion `AnimatePresence` for show/hide transitions

### Don't
- Don't paint the full page background with the gradient — too heavy
- Don't use pill-radius (9999px) on rectangular elements — use the scale above
- Don't put more than one gradient element visible at the same time
- Don't use font-weight 700+ on body text
- Don't add decorative elements with no functional value (random blobs, stars, etc.)
- Don't show a download button inside the `<video>` controls — only the explicit Download HD button triggers downloads
- Don't use `a.download = ''` without a proper filename — always pass `filename=instorix_SHORTCODE.mp4`

---

## 11. Globals & CSS Variables

Defined in `src/app/globals.css`:

```css
--color-insta-pink:    #E1306C;
--color-insta-purple:  #833AB4;
--color-insta-orange:  #F77737;
--color-insta-yellow:  #FCAF45;
--background-image-insta-gradient: linear-gradient(45deg, #F77737, #E1306C, #833AB4);
```

Tailwind shorthand (used throughout):
```
bg-insta-gradient     → linear-gradient(45deg, #F77737, #E1306C, #833AB4)
text-insta-pink       → #E1306C
text-insta-purple     → #833AB4
```

Page body background set in `@layer base`:
```css
body { background-color: #fafafa; }
```
