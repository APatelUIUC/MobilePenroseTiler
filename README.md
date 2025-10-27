# Mobile Penrose Tiler

Interactive Penrose tiling generator built with Next.js, designed to run smoothly on desktop and mobile and deploy quickly to Vercel. The original Python script from the OSS project is still available in `penrose.py` for reference.

## Features

- Real-time Penrose subdivision renderer with configurable layers (subdivisions)
- Instant canvas preview that adapts to any screen size
- Visual controls for colors, zoom level, and output resolution
- High-resolution PNG export with a single click
- Mobile-first layout with Tailwind CSS styling

## Project structure

```
.
├─ penrose.py           # Original CLI renderer for reference
├─ examples/            # Legacy gallery assets from the Python project
└─ web/                 # Next.js application (App Router + TypeScript)
   ├─ src/components/   # React components (Penrose UI)
   ├─ src/lib/          # Rendering + math utilities
   └─ public/           # Static assets
```

All web development happens inside the `web` directory.

## Getting started

```bash
cd web
npm install
npm run dev
```

Visit http://localhost:3000 to use the tiler locally. The preview updates in real time as you adjust settings.

## Deployment (Vercel)

1. Create a new project in Vercel and select this repository.
2. When prompted for the project settings:
   - **Framework**: Next.js  
   - **Root directory**: `web`  
   - **Build command**: `npm run build`  
   - **Output directory**: `.next`
3. Vercel installs dependencies and deploys automatically. Subsequent pushes to the configured branch retrigger deployments.

The build output is entirely static/SSR-friendly, so no additional configuration is required.

## Running tests & linting

```bash
cd web
npm run lint
```

## Notes

- For large subdivision counts (9–10) on lower-powered devices, expect rendering to take a second or two. The UI surfaces render time so you can tune settings before exporting.
- PNG export uses the configured resolution, so you can generate high-DPI assets (up to 4096×4096 by default).
- If you prefer the original CLI workflow, run `python3 penrose.py` and follow the prompts.
