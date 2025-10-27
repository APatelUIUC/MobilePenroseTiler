import TilerApp from "@/components/tiler-app";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-20 sm:px-6 lg:px-10">
        <header className="space-y-6 text-center sm:text-left">
          <span className="inline-flex items-center rounded-full border border-slate-700/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Generative tilings
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Tile the plane with Penrose, triangles, squares, or hexagons.
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-300 sm:mx-0 sm:text-lg">
            Pick a tiling family, tweak its structure, and remix colors on the fly. From aperiodic
            Penrose patterns to classic honeycomb grids, every view exports as a crisp, high-res PNG
            in seconds.
          </p>
        </header>
        <TilerApp />
        <footer className="text-xs text-slate-400">
          Built with Next.js, Tailwind, and a growing library of tilings. Works great on mobile and
          desktop, with offline support after the first load.
        </footer>
      </div>
    </main>
  );
}
