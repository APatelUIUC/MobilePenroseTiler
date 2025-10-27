'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ColorRole,
  RenderConfig,
  TILINGS,
  TilingControl,
  TilingDefinition,
  TilingOptionValue,
  TilingOptionsRecord,
  projectPolygons,
  renderToCanvas,
} from "@/lib/tilings";

const MIN_RESOLUTION = 256;
const MAX_RESOLUTION = 4096;

type OptionsState = Record<string, TilingOptionsRecord>;
type PaletteState = Record<string, Record<string, string>>;

const OVERSCAN_FACTOR = 1.12;

const randomHexColor = () => {
  const value = Math.floor(Math.random() * 0xffffff);
  return `#${value.toString(16).padStart(6, "0")}`;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toNumeric = (
  value: TilingOptionValue,
  fallback = 0,
): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatNumericDisplay = (value: number): string =>
  Number.isInteger(value) ? value.toString() : value.toFixed(2);

const buildInitialOptions = (): OptionsState =>
  Object.fromEntries(
    TILINGS.map((tiling) => [
      tiling.id,
      { ...tiling.options.defaults } as TilingOptionsRecord,
    ]),
  );

const buildInitialPalette = (): PaletteState =>
  Object.fromEntries(
    TILINGS.map((tiling) => [
      tiling.id,
      Object.fromEntries(
        tiling.colorRoles.map((role) => [role.id, role.default]),
      ),
    ]),
  );

const getOutlineColor = (
  palette: Record<string, string>,
  roles: ColorRole[],
) => palette[roles.find((role) => role.category === "outline")?.id ?? ""];

const fallbackOutlineWidth = (scale: number) => Math.max(scale * 0.015, 0.4);

const renderTiling = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  tiling: TilingDefinition,
  options: TilingOptionsRecord,
  palette: Record<string, string>,
) => {
  const generated = tiling.generate(options);
  const { polygons, scale } = projectPolygons(generated, width, height, {
    scaleMultiplier: tiling.scaleMultiplier?.(options),
    overscan: OVERSCAN_FACTOR,
  });

  const outlineWidth =
    tiling.outlineWidth?.(scale, options) ?? fallbackOutlineWidth(scale);

  const outlineColor =
    getOutlineColor(palette, tiling.colorRoles) ?? "#1e293b";

  const config: RenderConfig = {
    canvas,
    width,
    height,
    polygons,
    palette,
    outlineColor,
    outlineWidth,
  };

  renderToCanvas(config);
};

const formatResolution = (width: number, height: number) =>
  `${width} × ${height}`;

const ControlDescription = ({ text }: { text?: string }) =>
  text ? (
    <p className="text-xs text-slate-500 dark:text-slate-400">{text}</p>
  ) : null;

const TilingControlField = ({
  control,
  value,
  onInput,
}: {
  control: TilingControl;
  value: TilingOptionValue;
  onInput: (next: TilingOptionValue) => void;
}) => {
  if (control.type === "slider") {
    const safeValue = toNumeric(value, control.min ?? 0);
    const displayValue = formatNumericDisplay(safeValue);

    return (
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {control.label} ({displayValue})
        </label>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={safeValue}
          onChange={(event) => onInput(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-500 dark:bg-slate-700"
        />
        <input
          type="number"
          inputMode="numeric"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={Number(safeValue.toFixed(4))}
          onChange={(event) => onInput(Number(event.target.value))}
          className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <ControlDescription text={control.description} />
      </div>
    );
  }

  if (control.type === "select") {
    return (
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {control.label}
        </label>
        <select
          value={value}
          onChange={(event) => onInput(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          {control.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ControlDescription text={control.description} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {control.label}
      </label>
      {(() => {
        const safeValue = toNumeric(value, control.min ?? 0);
        return (
          <input
            type="number"
            value={Number(safeValue.toFixed(4))}
            min={control.min}
            max={control.max}
            step={control.step ?? 1}
            onChange={(event) => onInput(Number(event.target.value))}
            className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        );
      })()}
      <ControlDescription text={control.description} />
    </div>
  );
};

export const TilerApp = () => {
  const [tilingId, setTilingId] = useState(TILINGS[0]?.id ?? "");
  const [optionsById, setOptionsById] = useState<OptionsState>(
    buildInitialOptions,
  );
  const [paletteById, setPaletteById] = useState<PaletteState>(
    buildInitialPalette,
  );
  const [dimensions, setDimensions] = useState({ width: 1024, height: 1024 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [renderDuration, setRenderDuration] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeTiling = useMemo(
    () => TILINGS.find((tiling) => tiling.id === tilingId) ?? TILINGS[0],
    [tilingId],
  );

  const activeOptions = useMemo<TilingOptionsRecord>(
    () => ({
      ...activeTiling.options.defaults,
      ...(optionsById[activeTiling.id] ?? {}),
    }),
    [activeTiling, optionsById],
  );

  const activePalette = useMemo(
    () => ({ ...paletteById[activeTiling.id] }),
    [activeTiling.id, paletteById],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeTiling) return;

    const start = performance.now();
    renderTiling(
      canvas,
      dimensions.width,
      dimensions.height,
      activeTiling,
      activeOptions,
      activePalette,
    );
    setRenderDuration(performance.now() - start);
  }, [activePalette, activeOptions, activeTiling, dimensions]);

  const handleTilingChange = useCallback((nextId: string) => {
    setTilingId(nextId);
  }, []);

  const handleOptionChange = useCallback(
    (key: string, value: TilingOptionValue) => {
      const control = activeTiling.options.controls.find(
        (current) => current.key === key,
      );

      let nextValue: TilingOptionValue = value;

      if (
        control &&
        (control.type === "slider" || control.type === "number") &&
        typeof value === "number"
      ) {
        let numeric = value;
        if (typeof control.min === "number") {
          numeric = Math.max(numeric, control.min);
        }
        if (typeof control.max === "number") {
          numeric = Math.min(numeric, control.max);
        }
        const step = control.step ?? 1;
        if (Number.isFinite(step) && step > 0 && !Number.isInteger(step)) {
          const digits = step.toString().split(".")[1]?.length ?? 0;
          const factor = 10 ** digits;
          numeric = Math.round((numeric + Number.EPSILON) * factor) / factor;
        }
        nextValue = numeric;
      }

      setOptionsById((prev) => ({
        ...prev,
        [activeTiling.id]: {
          ...activeOptions,
          [key]: nextValue,
        },
      }));
    },
    [activeOptions, activeTiling],
  );

  const handleColorChange = useCallback(
    (roleId: string, color: string) => {
      setPaletteById((prev) => ({
        ...prev,
        [activeTiling.id]: {
          ...activePalette,
          [roleId]: color,
        },
      }));
    },
    [activePalette, activeTiling.id],
  );

  const handleRandomizeColors = useCallback(() => {
    const next = { ...activePalette };
    for (const role of activeTiling.colorRoles) {
      if (role.category === "fill") {
        next[role.id] = randomHexColor();
      }
    }
    setPaletteById((prev) => ({
      ...prev,
      [activeTiling.id]: next,
    }));
  }, [activePalette, activeTiling]);

  const handleResetCurrent = useCallback(() => {
    setOptionsById((prev) => ({
      ...prev,
      [activeTiling.id]: { ...activeTiling.options.defaults },
    }));
    setPaletteById((prev) => ({
      ...prev,
      [activeTiling.id]: Object.fromEntries(
        activeTiling.colorRoles.map((role) => [role.id, role.default]),
      ),
    }));
  }, [activeTiling]);

  const handleDimensionChange = useCallback(
    (key: "width" | "height", value: number) => {
      const clamped = clamp(Math.round(value), MIN_RESOLUTION, MAX_RESOLUTION);
      setDimensions((prev) => ({ ...prev, [key]: clamped }));
    },
    [],
  );

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
      link.download = `${activeTiling.id}-${timestamp}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  }, [activeTiling.id]);

  const resolutionLabel = useMemo(
    () => formatResolution(dimensions.width, dimensions.height),
    [dimensions],
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Choose a tiling style
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TILINGS.map((tiling) => {
            const isActive = tiling.id === activeTiling.id;
            return (
              <button
                key={tiling.id}
                type="button"
                onClick={() => handleTilingChange(tiling.id)}
                className={`flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 dark:hover:border-indigo-500/80 dark:hover:bg-indigo-500/10 ${
                  isActive
                    ? "border-indigo-500 bg-indigo-100/80 text-indigo-900 shadow-inner dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-100"
                    : "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <div className="text-3xl">{tiling.icon}</div>
                <div className="text-base font-semibold">{tiling.name}</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {tiling.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Fine-tune settings
        </h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {activeTiling.options.controls.map((control) => (
                <TilingControlField
                  key={control.key}
                  control={control}
                  value={activeOptions[control.key]}
                  onInput={(value) => handleOptionChange(control.key, value)}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRandomizeColors}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500"
              >
                Randomize fills
              </button>
              <button
                type="button"
                onClick={handleResetCurrent}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500"
              >
                Reset tiling defaults
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Output resolution
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs uppercase text-slate-500 dark:text-slate-400">
                  Width
                  <input
                    type="number"
                    inputMode="numeric"
                    min={MIN_RESOLUTION}
                    max={MAX_RESOLUTION}
                    step={64}
                    value={dimensions.width}
                    onChange={(event) =>
                      handleDimensionChange("width", Number(event.target.value))
                    }
                    className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs uppercase text-slate-500 dark:text-slate-400">
                  Height
                  <input
                    type="number"
                    inputMode="numeric"
                    min={MIN_RESOLUTION}
                    max={MAX_RESOLUTION}
                    step={64}
                    value={dimensions.height}
                    onChange={(event) =>
                      handleDimensionChange("height", Number(event.target.value))
                    }
                    className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preview updates instantly. Downloads use {resolutionLabel}.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Palette
              </span>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {activeTiling.colorRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex flex-col items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                  >
                    {role.label}
                    <input
                      type="color"
                      value={activePalette[role.id]}
                      onChange={(event) =>
                        handleColorChange(role.id, event.target.value)
                      }
                      className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                    />
                    <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {activePalette[role.id]}
                    </span>
                  </label>
                ))}
              </div>
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
            aria-label="Tiling preview"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span>
            Render time: {renderDuration.toFixed(1)} ms • {activeTiling.name}
          </span>
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

export default TilerApp;
