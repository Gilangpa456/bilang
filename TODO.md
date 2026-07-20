# TODO - Digital Scrapbook Flipbook (premium)

## Plan Implementation Steps
1. ✅ Refactor `src/components/JournalCarousel.jsx` (in progress -> scrapbook layer scaffold + parallax + flip duration upgrade):
   - Replace current “image flip” with “scrapbook page layers” per active index.
   - Implement deterministic random layout (seeded) per page using existing assets in `src/assets/`.
   - Add reveal sequence after flip complete with per-element stagger (60–120ms).
   - Add parallax (5–10px) on mouse move across layers.
   - Keep drag-based flip but upgrade animation duration to ~500–700ms and easing cubic-bezier.

2. Refactor `src/components/JournalCarousel.css`:
   - Upgrade 3D flip visuals: perspective 1500–2500px, preserve-3d, backface-visibility hidden.
   - Add paper texture/grain/noise.
   - Add lipatan highlight + dynamic-like shadow using CSS variables tied to flip progress.
   - Add styling + hover effects for photo/tape/sticker/text.

3. Update `src/index.css` / global styles if needed:
   - Add vintage fonts (fallbacks) and global grain overlay.

4. Testing:
   - Verify 60FPS smoothness (transform/translate3d only).
   - Verify reveal order per page (no simultaneous appearance).
   - Verify mobile swipe/drag stability (no breaking).

5. Run/build:
   - `npm run dev`
   - `npm run build` (optional)

