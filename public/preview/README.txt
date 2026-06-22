Place your preview image here as cover.jpg

When you swap to a different cover:
1. Replace public/preview/cover.jpg with your new image
2. Bump PREVIEW_VERSION in src/config/preview.ts (1 → 2 → 3 …)
3. Hard-refresh the browser (Ctrl+Shift+R)

If Edge still shows the old image:
- Press Ctrl+Shift+R (hard refresh)
- Or open DevTools (F12) → Network → check "Disable cache" → refresh

The image MUST stay in this folder:
  public/preview/cover.jpg
Moving it elsewhere means the site cannot load it.
