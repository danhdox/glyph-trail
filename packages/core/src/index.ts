export type GlyphTrailElementSource =
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLCanvasElement
  | ImageBitmap
  | OffscreenCanvas;
export type GlyphTrailSource = string | GlyphTrailElementSource;

export interface AdjustSettings {
  saturation: number;
  temperature: number;
  contrast: number;
}

export interface DitherSettings {
  threshold: number;
  mix: number;
  speed: number;
}

export interface GlyphSettings {
  preset: "organic" | "linear" | "dot-matrix";
  scale: number;
  gamma: number;
  phase: number;
  mix: number;
  colorMode: "texture" | "mono" | "heat";
  background: boolean;
}

export interface TrailSettings {
  radius: number;
  strength: number;
  hardness: number;
  tail: number;
  fluidity: number;
  dissipation: number;
  chromatic: number;
  momentum: number;
  noiseScale: number;
}

export interface GlowSettings {
  intensity: number;
  spread: number;
}

export interface GlitchSettings {
  intensity: number;
  speed: number;
}

export interface GlyphTrailSettings {
  adjust: AdjustSettings;
  dither: DitherSettings;
  glyph: GlyphSettings;
  trail: TrailSettings;
  glow: GlowSettings;
  glitch: GlitchSettings;
}

export type GlyphTrailSettingsInput = {
  [K in keyof GlyphTrailSettings]?: Partial<GlyphTrailSettings[K]>;
};

export interface GlyphTrailOptions {
  src?: GlyphTrailSource;
  source?: GlyphTrailSource;
  settings?: GlyphTrailSettingsInput;
  interactive?: boolean;
  autoplay?: boolean;
  paused?: boolean;
  pixelRatio?: number;
}

export interface GlyphTrailInstance {
  canvas: HTMLCanvasElement;
  destroy(): void;
  resize(): void;
  pause(): void;
  play(): void;
  update(options: Partial<GlyphTrailOptions>): void;
}

export const defaultSettings: GlyphTrailSettings = {
  adjust: {
    saturation: 198,
    temperature: -3,
    contrast: 100
  },
  dither: {
    threshold: 50,
    mix: 50,
    speed: 50
  },
  glyph: {
    preset: "organic",
    scale: 84,
    gamma: 100,
    phase: 100,
    mix: 100,
    colorMode: "texture",
    background: true
  },
  trail: {
    radius: 64,
    strength: 50,
    hardness: 0,
    tail: 44,
    fluidity: 36,
    dissipation: 1,
    chromatic: 25,
    momentum: 0,
    noiseScale: 86
  },
  glow: {
    intensity: 20,
    spread: 56
  },
  glitch: {
    intensity: 30,
    speed: 50
  }
};

export function normalizeSettings(input: GlyphTrailSettingsInput = {}): GlyphTrailSettings {
  return {
    adjust: { ...defaultSettings.adjust, ...input.adjust },
    dither: { ...defaultSettings.dither, ...input.dither },
    glyph: { ...defaultSettings.glyph, ...input.glyph },
    trail: { ...defaultSettings.trail, ...input.trail },
    glow: { ...defaultSettings.glow, ...input.glow },
    glitch: { ...defaultSettings.glitch, ...input.glitch }
  };
}

export function createGlyphTrail(canvas: HTMLCanvasElement, options: GlyphTrailOptions = {}): GlyphTrailInstance {
  return new GlyphTrailRenderer(canvas, options);
}

export function createDemoLotusSource(width = 1200, height = 780): HTMLCanvasElement {
  if (typeof document === "undefined") {
    throw new Error("createDemoLotusSource() requires a browser document.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create a 2D drawing context for the demo source.");
  }

  paintDemoLotus(context, width, height, 0);
  return canvas;
}

export function paintDemoLotus(context: CanvasRenderingContext2D, width: number, height: number, time = 0): void {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#020203";
  context.fillRect(0, 0, width, height);

  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const baseRadius = Math.min(width, height) * 0.46;
  const pulse = 1 + Math.sin(time * 0.0014) * 0.025;

  context.save();
  context.translate(centerX, centerY);
  context.globalCompositeOperation = "screen";

  const halo = context.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 0.98);
  halo.addColorStop(0, "rgba(255, 214, 140, 0.18)");
  halo.addColorStop(0.4, "rgba(255, 110, 150, 0.09)");
  halo.addColorStop(0.75, "rgba(150, 50, 110, 0.03)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = halo;
  context.beginPath();
  context.arc(0, 0, baseRadius * 0.98, 0, Math.PI * 2);
  context.fill();

  const rings = [
    { count: 13, radius: 0.8, size: 0.46, hueA: 320, hueB: 292, light: 56, alpha: 0.44 },
    { count: 11, radius: 0.62, size: 0.44, hueA: 332, hueB: 312, light: 60, alpha: 0.5 },
    { count: 9, radius: 0.44, size: 0.4, hueA: 346, hueB: 20, light: 64, alpha: 0.56 },
    { count: 7, radius: 0.28, size: 0.34, hueA: 28, hueB: 44, light: 68, alpha: 0.62 }
  ];

  for (const [r, ring] of rings.entries()) {
    const ringRadius = baseRadius * ring.radius * pulse;
    const petalLen = baseRadius * ring.size;
    const petalWide = petalLen * 0.66;

    for (let i = 0; i < ring.count; i += 1) {
      const wobble = Math.sin(i * 2.3 + r + time * 0.0009) * 0.06;
      const angle = (Math.PI * 2 * i) / ring.count + r * 0.4 + wobble;
      const px = Math.cos(angle) * ringRadius;
      const py = Math.sin(angle) * ringRadius;
      const hue = ring.hueA + (ring.hueB - ring.hueA) * (0.5 + 0.5 * Math.sin(i * 1.7 + r));

      context.save();
      context.translate(px, py);
      context.rotate(angle);
      context.scale(petalLen, petalWide);
      const petal = context.createRadialGradient(0, 0, 0, 0, 0, 1);
      petal.addColorStop(0, `hsla(${hue}, 95%, ${ring.light}%, ${ring.alpha})`);
      petal.addColorStop(0.55, `hsla(${hue}, 90%, ${ring.light - 14}%, ${ring.alpha * 0.5})`);
      petal.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = petal;
      context.beginPath();
      context.arc(0, 0, 1, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }

  const core = context.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 0.3);
  core.addColorStop(0, "rgba(255, 240, 170, 0.72)");
  core.addColorStop(0.35, "rgba(255, 200, 95, 0.5)");
  core.addColorStop(0.72, "rgba(255, 120, 80, 0.22)");
  core.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = core;
  context.beginPath();
  context.arc(0, 0, baseRadius * 0.3, 0, Math.PI * 2);
  context.fill();

  context.restore();
}

interface Particle {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  size: number;
  r: number;
  g: number;
  b: number;
  baseAlpha: number;
  phase: number;
}

/**
 * Renders a source image/video as a grid of square "pixel" particles. Moving the
 * pointer pushes nearby particles away from their home cell; they then ease back into
 * place. Dark cells are dropped so the subject sits on black and the edges scatter.
 */
class GlyphTrailRenderer implements GlyphTrailInstance {
  readonly canvas: HTMLCanvasElement;

  private readonly ctx: CanvasRenderingContext2D;
  private readonly sampler: HTMLCanvasElement;
  private readonly samplerCtx: CanvasRenderingContext2D;
  private readonly pointer = { x: 0, y: 0, active: false, speed: 0, moved: 0 };
  private readonly reducedMotion: boolean;
  private readonly resizeObserver?: ResizeObserver;
  private readonly pointerMoveHandler = (event: PointerEvent) => this.onPointerMove(event);
  private readonly pointerLeaveHandler = () => {
    this.pointer.active = false;
  };

  private settings: GlyphTrailSettings;
  private source?: GlyphTrailElementSource;
  private sourceToken = 0;
  private sourceIsVideo = false;
  private particles: Particle[] = [];
  private cols = 0;
  private rows = 0;
  private centroidX = 0;
  private centroidY = 0;
  private animationFrame = 0;
  private paused = false;
  private destroyed = false;
  private pixelRatio: number;
  private interactive: boolean;

  constructor(canvas: HTMLCanvasElement, options: GlyphTrailOptions) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Glyph Trail requires a 2D canvas context.");
    }
    this.ctx = ctx;

    const sampler = document.createElement("canvas");
    const samplerCtx = sampler.getContext("2d", { willReadFrequently: true });
    if (!samplerCtx) {
      throw new Error("Glyph Trail could not create a sampling context.");
    }
    this.sampler = sampler;
    this.samplerCtx = samplerCtx;

    this.settings = normalizeSettings(options.settings);
    this.pixelRatio = options.pixelRatio ?? getDevicePixelRatio();
    this.paused = options.paused ?? false;
    this.interactive = options.interactive ?? true;
    this.reducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (this.interactive) {
      canvas.addEventListener("pointermove", this.pointerMoveHandler, { passive: true });
      canvas.addEventListener("pointerdown", this.pointerMoveHandler, { passive: true });
      canvas.addEventListener("pointerenter", this.pointerMoveHandler, { passive: true });
      canvas.addEventListener("pointerleave", this.pointerLeaveHandler, { passive: true });
    }

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.rebuild());
      this.resizeObserver.observe(canvas);
    }

    this.updateSource(options.source ?? options.src ?? createFallbackTextureSource());

    if (this.paused) {
      this.renderStaticFrame();
    } else if (options.autoplay ?? true) {
      this.play();
    }
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver?.disconnect();
    this.canvas.removeEventListener("pointermove", this.pointerMoveHandler);
    this.canvas.removeEventListener("pointerdown", this.pointerMoveHandler);
    this.canvas.removeEventListener("pointerenter", this.pointerMoveHandler);
    this.canvas.removeEventListener("pointerleave", this.pointerLeaveHandler);
  }

  resize(): void {
    this.rebuild();
  }

  pause(): void {
    this.paused = true;
    cancelAnimationFrame(this.animationFrame);
  }

  play(): void {
    if (this.destroyed) {
      return;
    }
    this.paused = false;
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame((time) => this.render(time));
  }

  update(options: Partial<GlyphTrailOptions>): void {
    if (options.settings) {
      this.settings = normalizeSettings({
        adjust: { ...this.settings.adjust, ...options.settings.adjust },
        dither: { ...this.settings.dither, ...options.settings.dither },
        glyph: { ...this.settings.glyph, ...options.settings.glyph },
        trail: { ...this.settings.trail, ...options.settings.trail },
        glow: { ...this.settings.glow, ...options.settings.glow },
        glitch: { ...this.settings.glitch, ...options.settings.glitch }
      });
      this.rebuild();
    }

    if (options.pixelRatio !== undefined) {
      this.pixelRatio = options.pixelRatio;
      this.rebuild();
    }

    const nextSource = options.source ?? options.src;
    if (nextSource) {
      this.updateSource(nextSource);
    }

    if (options.paused === true) {
      this.pause();
    } else if (options.paused === false) {
      this.play();
    }
  }

  private updateSource(input: GlyphTrailSource): void {
    const token = ++this.sourceToken;

    if (typeof input !== "string") {
      this.source = input;
      this.sourceIsVideo = input instanceof HTMLVideoElement;
      this.rebuild();
      return;
    }

    void loadSource(input).then((source) => {
      if (this.destroyed || token !== this.sourceToken) {
        return;
      }
      this.source = source;
      this.sourceIsVideo = source instanceof HTMLVideoElement;
      this.rebuild();
    });
  }

  private onPointerMove(event: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const nextX = ((event.clientX - rect.left) / rect.width) * this.canvas.width;
    const nextY = ((event.clientY - rect.top) / rect.height) * this.canvas.height;
    if (this.pointer.active) {
      this.pointer.moved += Math.hypot(nextX - this.pointer.x, nextY - this.pointer.y);
    }
    this.pointer.x = nextX;
    this.pointer.y = nextY;
    this.pointer.active = true;
  }

  private rebuild(): void {
    if (this.destroyed) {
      return;
    }

    const cssWidth = this.canvas.clientWidth || this.canvas.width || 1;
    const cssHeight = this.canvas.clientHeight || this.canvas.height || 1;
    const width = Math.max(1, Math.floor(cssWidth * this.pixelRatio));
    const height = Math.max(1, Math.floor(cssHeight * this.pixelRatio));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.buildGrid(width, height);

    if (this.paused) {
      this.renderStaticFrame();
    }
  }

  private buildGrid(width: number, height: number): void {
    const source = this.source;
    if (!source || !isSourceReady(source)) {
      this.particles = [];
      return;
    }

    const cellCss = mix(14, 4.5, clamp(this.settings.glyph.scale / 120, 0, 1));
    const cell = Math.max(3, Math.round(cellCss * this.pixelRatio));
    const gap = Math.max(1, Math.round(2 * this.pixelRatio));
    const drawSize = Math.max(1, cell - gap);

    const cols = Math.max(1, Math.floor(width / cell));
    const rows = Math.max(1, Math.floor(height / cell));
    this.cols = cols;
    this.rows = rows;

    const offsetX = Math.round((width - cols * cell) / 2);
    const offsetY = Math.round((height - rows * cell) / 2);
    const inset = (cell - drawSize) / 2;

    const particles: Particle[] = new Array(cols * rows);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const homeX = offsetX + x * cell + inset;
        const homeY = offsetY + y * cell + inset;
        particles[y * cols + x] = {
          homeX,
          homeY,
          x: homeX,
          y: homeY,
          size: drawSize,
          r: 0,
          g: 0,
          b: 0,
          baseAlpha: 0,
          phase: hash(x + 0.5, y + 0.5) * Math.PI * 2
        };
      }
    }

    this.particles = particles;
    this.sampleColors();
  }

  private sampleColors(): void {
    const source = this.source;
    const { cols, rows, particles } = this;
    if (!source || !isSourceReady(source) || cols === 0 || rows === 0) {
      return;
    }

    this.sampler.width = cols;
    this.sampler.height = rows;

    const mediaWidth = getMediaWidth(source);
    const mediaHeight = getMediaHeight(source);
    const crop = coverCrop(mediaWidth, mediaHeight, cols, rows);

    this.samplerCtx.clearRect(0, 0, cols, rows);
    try {
      this.samplerCtx.drawImage(source, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, cols, rows);
    } catch {
      return; // cross-origin media without CORS headers
    }

    let data: Uint8ClampedArray;
    try {
      data = this.samplerCtx.getImageData(0, 0, cols, rows).data;
    } catch {
      return;
    }

    const settings = this.settings;
    const cutoff = 8 + (settings.dither.threshold / 100) * 120;
    const scatter = (settings.dither.mix / 100) * 80;
    const mixAlpha = clamp(settings.glyph.mix / 100, 0, 1);

    let sumX = 0;
    let sumY = 0;
    let visible = 0;

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const index = (y * cols + x) * 4;
        const particle = particles[y * cols + x];
        if (!particle) {
          continue;
        }

        const r = data[index] ?? 0;
        const g = data[index + 1] ?? 0;
        const b = data[index + 2] ?? 0;
        const a = data[index + 3] ?? 0;
        const brightness = r * 0.299 + g * 0.587 + b * 0.114;
        const jitter = (hash(x * 1.7, y * 1.7) - 0.5) * scatter;

        if (a < 45 || brightness < cutoff + jitter) {
          particle.baseAlpha = 0;
          continue;
        }

        const color = shadeColor(r, g, b, settings);
        particle.r = color[0];
        particle.g = color[1];
        particle.b = color[2];
        particle.baseAlpha = (a / 255) * mixAlpha;
        sumX += particle.homeX;
        sumY += particle.homeY;
        visible += 1;
      }
    }

    if (visible > 0) {
      this.centroidX = sumX / visible;
      this.centroidY = sumY / visible;
    } else {
      this.centroidX = this.canvas.width / 2;
      this.centroidY = this.canvas.height / 2;
    }
  }

  private renderStaticFrame(): void {
    if (this.destroyed) {
      return;
    }
    this.drawParticles(0);
  }

  private render(time: number): void {
    if (this.destroyed || this.paused) {
      return;
    }

    if (this.sourceIsVideo && this.source && isSourceReady(this.source)) {
      this.sampleColors();
    }

    this.drawParticles(time);
    this.animationFrame = requestAnimationFrame((next) => this.render(next));
  }

  private drawParticles(time: number): void {
    const ctx = this.ctx;
    const settings = this.settings;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";

    this.drawGlow(width, height);

    const radius = mix(60, 240, clamp(settings.trail.radius / 100, 0, 1)) * this.pixelRatio;
    const push = mix(40, 220, clamp(settings.trail.strength / 100, 0, 1)) * this.pixelRatio;
    const ease = mix(0.16, 0.05, clamp(settings.trail.tail / 100, 0, 1));
    const chroma = (settings.trail.chromatic / 100) * 10 * this.pixelRatio;
    const shimmerSpeed = 0.0012 + (settings.dither.speed / 100) * 0.003;
    const rounded = settings.glyph.preset === "organic";
    const dots = settings.glyph.preset === "dot-matrix";
    const pointerActive = this.pointer.active && !this.reducedMotion && settings.trail.strength > 0;

    // Track pointer speed (smoothed, decaying) so the glitch only fires while the cursor moves.
    this.pointer.speed = this.pointer.speed * 0.6 + this.pointer.moved * 0.4;
    this.pointer.moved = 0;

    // Glitch is driven by how fast you sweep the cursor through the pixels — not an idle effect.
    const glitchSetting = this.reducedMotion ? 0 : clamp(settings.glitch.intensity / 100, 0, 1);
    const speedRef = mix(60, 14, clamp(settings.glitch.speed / 100, 0, 1)) * this.pixelRatio;
    const speedNorm = clamp(this.pointer.speed / speedRef, 0, 1);
    const glitchAmount = pointerActive ? glitchSetting * speedNorm : 0;
    const jitterSeed = Math.floor(time / 40);

    for (const particle of this.particles) {
      if (particle.baseAlpha <= 0.01) {
        continue;
      }

      let targetX = particle.homeX;
      let targetY = particle.homeY;

      if (pointerActive) {
        const dx = particle.homeX - this.pointer.x;
        const dy = particle.homeY - this.pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < radius) {
          const force = (1 - distance / radius) ** 2;
          const angle = Math.atan2(dy, dx);
          targetX += Math.cos(angle) * push * force;
          targetY += Math.sin(angle) * push * force;
        }
      }

      particle.x += (targetX - particle.x) * ease;
      particle.y += (targetY - particle.y) * ease;

      const displaced = Math.abs(particle.x - particle.homeX) + Math.abs(particle.y - particle.homeY);

      // Glitch the pixels that are currently being pushed: digital jitter + extra RGB split,
      // scaled by cursor speed. Settles back to a clean push when the cursor stops.
      let drawX = particle.x;
      let drawY = particle.y;
      let glitchSplit = 0;
      if (glitchAmount > 0.01 && displaced > 0.6) {
        const jitter = glitchAmount * 12 * this.pixelRatio;
        drawX += (hash(particle.homeX * 0.21 + jitterSeed, particle.homeY * 0.13) - 0.5) * jitter;
        drawY += (hash(particle.homeY * 0.17 + jitterSeed, particle.homeX * 0.11) - 0.5) * jitter * 0.6;
        glitchSplit = glitchAmount * 16 * this.pixelRatio;
      }

      const chromaSplit = chroma > 0.2 && displaced > 0.6 ? Math.min(chroma, displaced * 0.5) : 0;
      const split = chromaSplit + glitchSplit;

      const shimmer = 0.84 + Math.sin(time * shimmerSpeed + particle.phase) * 0.16;
      const alpha = clamp(particle.baseAlpha * shimmer, 0, 1);
      const size = particle.size;

      if (split > 0.5) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = alpha;
        fillCell(ctx, drawX + split, drawY, size, `rgb(${particle.r},0,0)`, rounded, dots);
        fillCell(ctx, drawX, drawY, size, `rgb(0,${particle.g},0)`, rounded, dots);
        fillCell(ctx, drawX - split, drawY, size, `rgb(0,0,${particle.b})`, rounded, dots);
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.globalAlpha = alpha;
        fillCell(ctx, drawX, drawY, size, `rgb(${particle.r},${particle.g},${particle.b})`, rounded, dots);
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  private drawGlow(width: number, height: number): void {
    const intensity = this.settings.glow.intensity;
    if (intensity <= 0 || this.particles.length === 0) {
      return;
    }

    const radius = Math.max(width, height) * (0.18 + (this.settings.glow.spread / 100) * 0.42);
    const alpha = clamp((intensity / 100) * 0.55, 0, 0.7);
    const gradient = this.ctx.createRadialGradient(
      this.centroidX,
      this.centroidY,
      0,
      this.centroidX,
      this.centroidY,
      radius
    );
    gradient.addColorStop(0, `rgba(255, 214, 170, ${alpha})`);
    gradient.addColorStop(0.45, `rgba(255, 120, 150, ${alpha * 0.4})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
    this.ctx.globalCompositeOperation = "source-over";
  }
}

function fillCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  rounded: boolean,
  dot: boolean
): void {
  ctx.fillStyle = color;

  if (dot) {
    const r = size / 2;
    ctx.beginPath();
    ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (rounded && typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, size * 0.28);
    ctx.fill();
    return;
  }

  ctx.fillRect(x, y, size, size);
}

function shadeColor(r: number, g: number, b: number, settings: GlyphTrailSettings): [number, number, number] {
  let cr = r / 255;
  let cg = g / 255;
  let cb = b / 255;

  const gray = cr * 0.299 + cg * 0.587 + cb * 0.114;
  const saturation = settings.adjust.saturation / 100;
  cr = gray + (cr - gray) * saturation;
  cg = gray + (cg - gray) * saturation;
  cb = gray + (cb - gray) * saturation;

  const temperature = settings.adjust.temperature / 100;
  cr += temperature * 0.12;
  cb -= temperature * 0.12;

  const contrast = settings.adjust.contrast / 100;
  cr = (cr - 0.5) * (1 + contrast) + 0.5;
  cg = (cg - 0.5) * (1 + contrast) + 0.5;
  cb = (cb - 0.5) * (1 + contrast) + 0.5;

  cr = clamp(cr, 0, 1);
  cg = clamp(cg, 0, 1);
  cb = clamp(cb, 0, 1);

  const luma = cr * 0.299 + cg * 0.587 + cb * 0.114;

  if (settings.glyph.colorMode === "mono") {
    const v = clamp(0.46 + luma * 0.9, 0, 1);
    return [Math.round(245 * v), Math.round(240 * v), Math.round(230 * v)];
  }

  if (settings.glyph.colorMode === "heat") {
    const hotA: [number, number, number] = [56, 13, 41];
    const hotB: [number, number, number] = [255, 46, 110];
    const hotC: [number, number, number] = [255, 224, 92];
    const t1 = smoothstep(0.05, 0.65, luma);
    const mid: [number, number, number] = [
      lerp(hotA[0], hotB[0], t1),
      lerp(hotA[1], hotB[1], t1),
      lerp(hotA[2], hotB[2], t1)
    ];
    const t2 = smoothstep(0.55, 1, luma);
    return [
      Math.round(lerp(mid[0], hotC[0], t2)),
      Math.round(lerp(mid[1], hotC[1], t2)),
      Math.round(lerp(mid[2], hotC[2], t2))
    ];
  }

  return [Math.round(cr * 255), Math.round(cg * 255), Math.round(cb * 255)];
}

function coverCrop(
  mediaWidth: number,
  mediaHeight: number,
  targetWidth: number,
  targetHeight: number
): { sx: number; sy: number; sw: number; sh: number } {
  const mediaAspect = mediaWidth / Math.max(mediaHeight, 1);
  const targetAspect = targetWidth / Math.max(targetHeight, 1);

  if (mediaAspect > targetAspect) {
    const sw = mediaHeight * targetAspect;
    return { sx: (mediaWidth - sw) / 2, sy: 0, sw, sh: mediaHeight };
  }

  const sh = mediaWidth / targetAspect;
  return { sx: 0, sy: (mediaHeight - sh) / 2, sw: mediaWidth, sh };
}

function getMediaWidth(source: GlyphTrailElementSource): number {
  if (source instanceof HTMLVideoElement) {
    return source.videoWidth || 1;
  }
  if (source instanceof HTMLImageElement) {
    return source.naturalWidth || 1;
  }
  return ("width" in source && typeof source.width === "number" ? source.width : 1) || 1;
}

function getMediaHeight(source: GlyphTrailElementSource): number {
  if (source instanceof HTMLVideoElement) {
    return source.videoHeight || 1;
  }
  if (source instanceof HTMLImageElement) {
    return source.naturalHeight || 1;
  }
  return ("height" in source && typeof source.height === "number" ? source.height : 1) || 1;
}

function createFallbackTextureSource(): HTMLCanvasElement {
  return createDemoLotusSource(1200, 780);
}

function getDevicePixelRatio(): number {
  return typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2);
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hash(x: number, y: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

async function loadSource(src: string): Promise<HTMLImageElement | HTMLVideoElement> {
  if (/\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(src)) {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.src = src;

    await new Promise<void>((resolve, reject) => {
      video.addEventListener("loadeddata", () => resolve(), { once: true });
      video.addEventListener("error", () => reject(new Error(`Could not load video source: ${src}`)), { once: true });
    });

    await video.play().catch(() => undefined);
    return video;
  }

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;

  await new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => reject(new Error(`Could not load image source: ${src}`)), { once: true });
  });

  return image;
}

function isSourceReady(source: GlyphTrailElementSource): boolean {
  if (source instanceof HTMLVideoElement) {
    return source.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && source.videoWidth > 0;
  }
  if (source instanceof HTMLImageElement) {
    return source.complete && source.naturalWidth > 0;
  }
  return true;
}
