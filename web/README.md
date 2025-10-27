## Mobile Penrose Tiler (web app)

This directory contains the Next.js implementation of the Penrose tiler UI. The app uses the App Router, Tailwind CSS, and TypeScript.

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

- All Penrose math and rendering utilities live in `src/lib/penrose.ts`.
- UI components, including the interactive canvas, live in `src/components/`.
- The renderer operates entirely client-side and exports a PNG via the browser `canvas` API. No serverless functions are required.
