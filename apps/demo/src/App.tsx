import { useMemo, useState } from "react";
import { Copy, Github, Pause, Play, SlidersHorizontal } from "lucide-react";
import { normalizeSettings, type GlyphTrailSettings } from "@glyph-trail/core";
import { GlyphTrailCanvas } from "@glyph-trail/react";

const DEMO_SOURCE = "/lotus.jpg";

type PresetId = "lotus" | "cyberPoster" | "softGlow" | "highNoise";
type ActivePreset = PresetId | "custom";
type NumericGroup = "adjust" | "dither" | "trail" | "glow";

const presets: Record<PresetId, GlyphTrailSettings> = {
  lotus: normalizeSettings(),
  cyberPoster: normalizeSettings({
    adjust: { saturation: 230, temperature: -18, contrast: 120 },
    dither: { threshold: 42, mix: 62, speed: 64 },
    glyph: { scale: 72, gamma: 86, phase: 74, mix: 100, colorMode: "heat" },
    trail: { radius: 72, strength: 66, tail: 58, fluidity: 48, chromatic: 42, noiseScale: 98 },
    glow: { intensity: 24, spread: 46 }
  }),
  softGlow: normalizeSettings({
    adjust: { saturation: 158, temperature: 8, contrast: 72 },
    dither: { threshold: 45, mix: 34, speed: 22 },
    glyph: { scale: 92, gamma: 112, phase: 34, mix: 88, colorMode: "texture" },
    trail: { radius: 84, strength: 32, tail: 68, fluidity: 18, chromatic: 10, noiseScale: 38 },
    glow: { intensity: 32, spread: 76 }
  }),
  highNoise: normalizeSettings({
    adjust: { saturation: 255, temperature: -28, contrast: 142 },
    dither: { threshold: 54, mix: 94, speed: 88 },
    glyph: { preset: "linear", scale: 64, gamma: 72, phase: 100, mix: 100, colorMode: "mono" },
    trail: { radius: 54, strength: 78, tail: 38, fluidity: 62, chromatic: 60, noiseScale: 100 },
    glow: { intensity: 12, spread: 34 }
  })
};

const presetLabels: Record<PresetId, string> = {
  lotus: "Lotus",
  cyberPoster: "Cyber Poster",
  softGlow: "Soft Glow",
  highNoise: "High Noise"
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function App() {
  const [settings, setSettings] = useState<GlyphTrailSettings>(() => normalizeSettings());
  const [activePreset, setActivePreset] = useState<ActivePreset>("lotus");
  const [paused, setPaused] = useState(prefersReducedMotion);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const snippet = useMemo(() => buildSnippet(settings), [settings]);

  const applyPreset = (preset: PresetId) => {
    setActivePreset(preset);
    setSettings(presets[preset]);
  };

  const updateNumeric = <Group extends NumericGroup>(
    group: Group,
    key: keyof GlyphTrailSettings[Group],
    value: number
  ) => {
    setActivePreset("custom");
    setSettings((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [key]: value
      }
    }));
  };

  const updateGlyph = <Key extends keyof GlyphTrailSettings["glyph"]>(
    key: Key,
    value: GlyphTrailSettings["glyph"][Key]
  ) => {
    setActivePreset("custom");
    setSettings((current) => ({
      ...current,
      glyph: {
        ...current.glyph,
        [key]: value
      }
    }));
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  };

  return (
    <main className="app-shell">
      <section className="stage" aria-label="Interactive Glyph Trail demo">
        <GlyphTrailCanvas
          className="glyph-canvas"
          src={DEMO_SOURCE}
          settings={settings}
          paused={paused}
          interactive
          aria-label="Lotus flower rendered as interactive glyph pixels"
        />

        <header className="topbar">
          <a className="wordmark" href="#top" aria-label="Glyph Trail home">
            <span>Glyph</span>
            <span>Trail</span>
          </a>
          <nav className="nav-links" aria-label="Project links">
            <a href="#install">Install</a>
            <a href="#api">API</a>
            <a href="https://github.com/Andrewdddobusiness/glyph-trail" target="_blank" rel="noreferrer">
              <Github size={16} aria-hidden="true" />
              GitHub
            </a>
          </nav>
        </header>

        <div className="poster-copy" id="top">
          <p className="vertical-label">Canvas pixel effect</p>
          <h1>LOTUS</h1>
          <p className="poster-meta">Interactive glyph dither for images and video</p>
        </div>

        <div className="preset-strip" aria-label="Preset controls">
          {(Object.keys(presets) as PresetId[]).map((preset) => (
            <button
              className={preset === activePreset ? "preset-button active" : "preset-button"}
              key={preset}
              type="button"
              onClick={() => applyPreset(preset)}
            >
              {presetLabels[preset]}
            </button>
          ))}
          <button className="icon-button" type="button" onClick={() => setPaused((value) => !value)}>
            {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
            <span>{paused ? "Play" : "Pause"}</span>
          </button>
        </div>

        <aside className="control-dock" aria-label="Effect controls">
          <div className="dock-heading">
            <SlidersHorizontal size={18} aria-hidden="true" />
            <span>Live Controls</span>
          </div>

          <ControlSlider
            label="Glyph scale"
            value={settings.glyph.scale}
            min={20}
            max={120}
            onChange={(value) => updateGlyph("scale", value)}
          />
          <ControlSlider
            label="Glyph mix"
            value={settings.glyph.mix}
            min={0}
            max={100}
            onChange={(value) => updateGlyph("mix", value)}
          />
          <ControlSlider
            label="Dither mix"
            value={settings.dither.mix}
            min={0}
            max={100}
            onChange={(value) => updateNumeric("dither", "mix", value)}
          />
          <ControlSlider
            label="Threshold"
            value={settings.dither.threshold}
            min={0}
            max={100}
            onChange={(value) => updateNumeric("dither", "threshold", value)}
          />
          <ControlSlider
            label="Trail radius"
            value={settings.trail.radius}
            min={0}
            max={100}
            onChange={(value) => updateNumeric("trail", "radius", value)}
          />
          <ControlSlider
            label="Trail strength"
            value={settings.trail.strength}
            min={0}
            max={100}
            onChange={(value) => updateNumeric("trail", "strength", value)}
          />
          <ControlSlider
            label="Chromatic"
            value={settings.trail.chromatic}
            min={0}
            max={100}
            onChange={(value) => updateNumeric("trail", "chromatic", value)}
          />
          <ControlSlider
            label="Glow"
            value={settings.glow.intensity}
            min={0}
            max={60}
            onChange={(value) => updateNumeric("glow", "intensity", value)}
          />

          <div className="select-row">
            <label htmlFor="glyph-preset">Glyph preset</label>
            <select
              id="glyph-preset"
              value={settings.glyph.preset}
              onChange={(event) => updateGlyph("preset", event.target.value as GlyphTrailSettings["glyph"]["preset"])}
            >
              <option value="organic">Organic</option>
              <option value="linear">Linear</option>
              <option value="dot-matrix">Dot Matrix</option>
            </select>
          </div>

          <div className="select-row">
            <label htmlFor="color-mode">Color mode</label>
            <select
              id="color-mode"
              value={settings.glyph.colorMode}
              onChange={(event) => updateGlyph("colorMode", event.target.value as GlyphTrailSettings["glyph"]["colorMode"])}
            >
              <option value="texture">Texture</option>
              <option value="mono">Mono</option>
              <option value="heat">Heat</option>
            </select>
          </div>
        </aside>
      </section>

      <section className="docs-band" id="install">
        <div className="docs-copy">
          <h2>Install in 60 seconds</h2>
          <p>
            Drop a full-bleed pixel-particle canvas into a hero, portfolio, or creative coding site. Use the core renderer
            directly or the React wrapper.
          </p>
        </div>
        <pre className="terminal-block"><code>pnpm add @glyph-trail/core @glyph-trail/react</code></pre>
      </section>

      <section className="api-band" id="api">
        <div className="code-panel">
          <div className="code-panel-header">
            <span>React example</span>
            <button className="copy-button" type="button" onClick={copySnippet}>
              <Copy size={16} aria-hidden="true" />
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
            </button>
          </div>
          <pre><code>{snippet}</code></pre>
        </div>
      </section>
    </main>
  );
}

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange(value: number): void;
}

function ControlSlider({ label, value, min, max, onChange }: ControlSliderProps) {
  return (
    <label className="control-slider">
      <span>
        <span>{label}</span>
        <strong>{Math.round(value)}</strong>
      </span>
      <input
        min={min}
        max={max}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function buildSnippet(settings: GlyphTrailSettings): string {
  const compact = {
    adjust: settings.adjust,
    dither: settings.dither,
    glyph: settings.glyph,
    trail: {
      radius: settings.trail.radius,
      strength: settings.trail.strength,
      tail: settings.trail.tail,
      fluidity: settings.trail.fluidity,
      chromatic: settings.trail.chromatic,
      noiseScale: settings.trail.noiseScale
    },
    glow: settings.glow
  };

  return `import { GlyphTrailCanvas } from "@glyph-trail/react";

export function Hero() {
  return (
    <GlyphTrailCanvas
      src="/flower.mp4"
      interactive
      settings={${JSON.stringify(compact, null, 8).replace(/\n/g, "\n      ")}}
    />
  );
}`;
}
