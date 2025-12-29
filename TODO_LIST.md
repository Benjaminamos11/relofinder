# 📝 MASTER TODO LIST & ASSET PLAN

## 🎨 Content Visuals & Assets

### 1. Blog Post Images (High Priority)
**Goal:** Replace any stock/placeholder images in blog posts with custom generated assets.
**Style Guide:**
*   **Base:** High-quality black and white photography.
*   **Accent:** ONE single element in Brand Orange (#FF6F61).
*   **Interaction:** The orange element should ideally be the focal point.
*   **Vibe:** Professional, clean, Swiss-minimalist.

**Action Items:**
- [x] Audit all files in `src/content/blog` for current image usage.
- [x] **Generate "B&W + Orange" Cover Images**:
    - [x] `best-health-insurance-consultants`: Stethoscope or medical doc (B&W) with orange cross/stamp.
    - [x] `best-relocation-agencies`: Compass or map (B&W) with orange path/pin.
    - [x] `best-relocation-companies`: Handshake or office (B&W) with orange tie/detail.
    - [x] `cost-of-living`: Coins/Swiss Francs (B&W) with one orange glowing coin.
    - [x] `home-search`: Row of houses (B&W) with one orange door.
    - [x] `mandatory-insurance`: Shield/umbrella (B&W) with orange protection layer.
    - [x] `moving-checklist`: Clipboard/checklist (B&W) with orange checkmark.
    - [x] `reverse-application-strategy`: Chessboard or strategy layout (B&W) with orange king/piece.
    - [x] `ultimate-guide`: Swiss Alps/Landscape (B&W) with orange hiking trail marker.
- [x] Ensure all new images are saved in `/public/images/blog/` for optimized serving.

### 2. Service Pages (Completed ✅)
*   **Education:** Modern study desk with orange notebook.
*   **Advisory:** Corporate boardroom with orange pen.
*   **Insurance:** Hands holding model house with orange roof.

## 🚀 Pre-Production & SEO

### 1. SEO Configuration
- [x] **Robots.txt**: Verified. Allows crawlers to access critical paths (`/companies`, `/services`) and blocks admin areas.
- [x] **Sitemap**: Configured via `@astrojs/sitemap`. Located at `https://relofinder.ch/sitemap-index.xml`.
- [ ] **Verify Sitemap Generation**: Run `npm run build` locally to confirm `sitemap-index.xml` is actually generated in `dist/`.

### 2. Legal & Compliance
- [ ] **Impressum**: Review `src/pages/impressum.astro` (Clean, no placeholders).
- [ ] **Terms**: Review `src/pages/terms.astro` (Clean, no placeholders).
- [ ] **Privacy Policy**: Ensure it mentions data handling (Supabase) if not already.

### 3. Analytics & Monitoring
- [x] **Plausible Analytics**: Script present in `Layout.astro`.
- [ ] **Error Logging**: Verify if Sentry or similar is needed (currently relying on console/server logs).

## 🛠 Next Steps
1.  **Execute Blog Image Generation**: Go through each blog post title, generate a prompt, create the image, and update the markdown frontmatter.
2.  **Build Verification**: Run a full production build to ensure checking links and sitemap.
