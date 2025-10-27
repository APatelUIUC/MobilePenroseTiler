# Mobile Tiling Studio

Interactive tiling playground built with Next.js, designed to run smoothly on desktop and mobile and deploy quickly to Vercel. The original Python script from the OSS project is still available in `penrose.py` for reference.

## Features

- Penrose, triangular, parallelogram, and hexagonal tilings with unique controls
- Real-time subdivision and lattice rendering with smooth canvas scaling
- Instant canvas preview that adapts to any screen size
- Per-tiling parameter controls (e.g., rotation, density, zoom) that update live
- Visual palette editor with randomizers and built-in outline/background roles
- High-resolution PNG export with a single click
- Mobile-first layout with Tailwind CSS styling

## Project structure

```
.
├─ penrose.py           # Original CLI renderer for reference
├─ examples/            # Legacy gallery assets from the Python project
└─ web/                 # Next.js application (App Router + TypeScript)
   ├─ src/components/   # React components (tiling UI & controls)
   ├─ src/lib/          # Tiling math, geometry helpers, and renderer
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

- Penrose subdivisions beyond 9–10 may take longer on low-powered devices; the render time indicator lets you tune settings before exporting.
- PNG export uses the configured resolution, so you can generate high-DPI assets (up to 4096×4096 by default).
- Triangular, parallelogram, and hex tilings include density, angle, and orientation controls so you can chase patterns like isohedral diamonds or honeycomb alternation.
- If you prefer the original CLI workflow, run `python3 penrose.py` and follow the prompts.
