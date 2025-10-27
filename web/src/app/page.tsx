import PenroseApp from "@/components/penrose-app";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-20 sm:px-6 lg:px-10">
        <header className="space-y-6 text-center sm:text-left">
          <span className="inline-flex items-center rounded-full border border-slate-700/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Penrose tiler
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Create infinite aperiodic patterns right in your browser.
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-300 sm:mx-0 sm:text-lg">
            Adjust the subdivisions, zoom, palette, and resolution to generate a Penrose tiling that
            looks great on desktop or mobile. Download a high-resolution PNG when you&apos;re ready
            to share it or ship it to Vercel.
          </p>
        </header>
        <PenroseApp />
        <footer className="text-xs text-slate-400">
          Built with Next.js, Tailwind, and the golden ratio. Works offline once loaded and scales
          to high-resolution exports.
        </footer>
      </div>
    </main>
  );
}
