## Mobile Tiling Studio (web app)

This directory contains the Next.js implementation of the tiling playground. The app offers Penrose, Einstein hat, triangular, parallelogram, and hexagonal tilings with per-pattern controls, Tailwind styling, and TypeScript types throughout.

### Scripts

```bash
npm install      # install dependencies
npm run dev      # start the development server on http://localhost:3000
npm run build    # create a production build
npm run start    # serve the production build (after running build)
npm run lint     # run ESLint
```

### Deploying to Vercel

The project deploys with the default Next.js settings:

- Root directory: `web`
- Build command: `npm run build`
- Output directory: `.next`

Any push to the configured branch will trigger a new Vercel build.

### Project notes

- `src/lib/tilings.ts` centralises tiling definitions, controls, palette roles, projection, and canvas rendering.
- `src/lib/einstein.ts` ports the official hat substitution system so the Einstein monotile renders accurately.
- `src/lib/geometry.ts` houses reusable vector helpers used by each tiling generator.
- `src/components/tiler-app.tsx` renders the full UI (tiling picker, per-pattern controls, palette editor, canvas preview).
- You can extend the experience by adding new tiling definitions to `src/lib/tilings.ts` – the UI will automatically surface new controls based on the schema.
