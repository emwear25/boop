# boop.bg — storefront

Bulgarian store for 3D-printed bowls and walk organisers for dogs and cats.
Visual build: catalogue is local (`app/data/catalog.ts`), checkout shows a "coming soon" message.
Nothing here touches emWear or Imagoo.

## Run
```bash
npm install
npm run dev      # http://localhost:3002  (emWear :3000, Imagoo :3001)
```

## Stack
Nuxt 4, Pinia (cart in localStorage), GSAP + ScrollTrigger, Lenis smooth scroll.
Fonts: Cormorant Garamond (display) + Jost (text), both with Cyrillic, self-hosted via @fontsource.

## Design tokens (`app/assets/css/main.css`)
mist #e9ebdf (ground) · moss #23301f (ink, logo, buttons) · sage #8c9e7a · paper #f8f7f1 · cherry #c7383b (heart accent, sparingly)

## Images
- `tools/images/refs/` — source renders used as references
- `tools/images/build-jobs.mjs` → `jobs.json`; `generate.mjs jobs.json` calls BytePlus Seedream 5.5
  (key in `.env`, skips existing files, hard budget cap in `ledger.json`)
- `python3 tools/images/publish.py` → WebP in `public/img` (1400w + 700w `-sm`)

## Next
- Add store `boop` to `../server/config/stores.js` + `dashboard/src/utils/shops.ts` (see server/MULTI_STORE.md), then swap the local catalogue for `/api/catalog` with `X-Store: boop`.
- 3D product viewer (TresJS + GLB) on product pages.
