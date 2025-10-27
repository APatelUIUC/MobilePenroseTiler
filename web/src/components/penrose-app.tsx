'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderPenrose } from "@/lib/penrose";

type ZoomOption = "in" | "out";

interface PenroseSettings {
  divisions: number;
  zoom: ZoomOption;
  width: number;
  height: number;
  colors: {
    thin: string;
    thick: string;
    outline: string;
    background: string;
  };
}

const MIN_DIVISIONS = 1;
const MAX_DIVISIONS = 10;
const MIN_RESOLUTION = 256;
const MAX_RESOLUTION = 4096;

const DEFAULT_SETTINGS: PenroseSettings = {
  divisions: 7,
  zoom: "in",
  width: 1024,
  height: 1024,
  colors: {
    thin: "#cc4c4c",
    thick: "#3a70b8",
    outline: "#111827",
    background: "#f8fafc",
  },
};

const randomHexColor = () => {
  const value = Math.floor(Math.random() * 0xffffff);
  return `#${value.toString(16).padStart(6, "0")}`;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const PenroseApp = () => {
  const [settings, setSettings] = useState<PenroseSettings>(() => ({
    ...DEFAULT_SETTINGS,
    colors: { ...DEFAULT_SETTINGS.colors },
  }));
  const [isDownloading, setIsDownloading] = useState(false);
  const [renderDuration, setRenderDuration] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const start = performance.now();
    renderPenrose(canvas, {
      divisions: settings.divisions,
      width: settings.width,
      height: settings.height,
      zoom: settings.zoom,
      colors: settings.colors,
    });
    setRenderDuration(performance.now() - start);
  }, [settings]);

  const updateNumericSetting = useCallback(
    (key: keyof Pick<PenroseSettings, "divisions" | "width" | "height">, value: number) => {
      setSettings((prev) => ({
        ...prev,
        [key]:
          key === "divisions"
            ? clamp(Math.round(value), MIN_DIVISIONS, MAX_DIVISIONS)
            : clamp(Math.round(value), MIN_RESOLUTION, MAX_RESOLUTION),
      }));
    },
    [],
  );

  const updateColor = useCallback((key: keyof PenroseSettings["colors"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  }, []);

  const handleZoomChange = useCallback((value: ZoomOption) => {
    setSettings((prev) => ({ ...prev, zoom: value }));
  }, []);

  const handleRandomizeColors = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        thin: randomHexColor(),
        thick: randomHexColor(),
        outline: randomHexColor(),
      },
    }));
  }, []);

  const handleReset = useCallback(() => {
    setSettings({
      ...DEFAULT_SETTINGS,
      colors: { ...DEFAULT_SETTINGS.colors },
    });
  }, []);

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((created) => resolve(created), "image/png"),
      );

      if (!blob) {
        throw new Error("Unable to export image");
      }

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `penrose-${timestamp}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error(error);
      // Surface errors in dev tools – UI remains simple.
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const resolutionLabel = useMemo(() => `${settings.width} × ${settings.height}`, [settings]);

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Configure the tiling
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Subdivisions ({settings.divisions})
            </label>
            <input
              type="range"
              min={MIN_DIVISIONS}
              max={MAX_DIVISIONS}
              value={settings.divisions}
              onChange={(event) => updateNumericSetting("divisions", Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-500 dark:bg-slate-700"
            />
            <input
              type="number"
              inputMode="numeric"
              min={MIN_DIVISIONS}
              max={MAX_DIVISIONS}
              value={settings.divisions}
              onChange={(event) => updateNumericSetting("divisions", Number(event.target.value))}
              className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Higher values add detail but take longer to draw on older devices.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Zoom</span>
            <div className="flex w-full gap-3">
              {(["in", "out"] as ZoomOption[]).map((value) => {
                const isActive = settings.zoom === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleZoomChange(value)}
                    className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500/60 ${
                      isActive
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500"
                    }`}
                  >
                    {value === "in" ? "Fill Canvas" : "Show Decagon"}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              “Fill Canvas” crops to the tiling edges. “Show Decagon” adds breathing room.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Output resolution
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-slate-500 dark:text-slate-400">Width</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={MIN_RESOLUTION}
                  max={MAX_RESOLUTION}
                  step={64}
                  value={settings.width}
                  onChange={(event) => updateNumericSetting("width", Number(event.target.value))}
                  className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-slate-500 dark:text-slate-400">Height</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={MIN_RESOLUTION}
                  max={MAX_RESOLUTION}
                  step={64}
                  value={settings.height}
                  onChange={(event) => updateNumericSetting("height", Number(event.target.value))}
                  className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Preview updates instantly. Downloads use the full resolution ({resolutionLabel}).
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Palette
            </span>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {([
                { key: "thin", label: "Thin tiles" },
                { key: "thick", label: "Thick tiles" },
                { key: "outline", label: "Outline" },
                { key: "background", label: "Background" },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex flex-col items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {label}
                  <input
                    type="color"
                    value={settings.colors[key]}
                    onChange={(event) => updateColor(key, event.target.value)}
                    className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                    aria-label={label}
                  />
                  <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {settings.colors[key]}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRandomizeColors}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500"
              >
                Randomize colors
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500"
              >
                Reset defaults
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <canvas
            ref={canvasRef}
            className="h-auto w-full rounded-2xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800"
            style={{ maxHeight: "80vh" }}
            aria-label="Penrose tiling preview"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span>Render time: {renderDuration.toFixed(1)} ms</span>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isDownloading ? "Preparing…" : "Download PNG"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default PenroseApp;
