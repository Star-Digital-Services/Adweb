Place your preview image here as cover.jpg

When you swap to a different cover:
1. Replace public/preview/cover.jpg with your new image
2. Bump NEXT_PUBLIC_PREVIEW_VERSION in .env (1 → 2 → 3 …)
3. Restart npm run dev (or save .env and hard-refresh)

If Edge still shows the old image:
- Press Ctrl+Shift+R (hard refresh)
- Or open DevTools (F12) → Network → check "Disable cache" → refresh

The image MUST stay in this folder:
  public/preview/cover.jpg
Moving it elsewhere means the site cannot load it.
