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
    threshold: 30,
    mix: 38,
    speed: 42
  },
  glyph: {
    preset: "organic",
    scale: 92,
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
    intensity: 34,
    spread: 62
  },
  glitch: {
    intensity: 38,
    speed: 42
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

  const centerX = width * 0.53;
  const centerY = height * 0.47;
  const petalCount = 26;
  const pulse = Math.sin(time * 0.0016) * 0.04;

  const halo = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.42);
  halo.addColorStop(0, "rgba(255, 225, 115, 0.28)");
  halo.addColorStop(0.3, "rgba(255, 76, 146, 0.19)");
  halo.addColorStop(0.7, "rgba(130, 44, 92, 0.08)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = halo;
  context.fillRect(0, 0, width, height);

  context.save();
  context.translate(centerX, centerY);
  context.globalCompositeOperation = "screen";

  for (let index = 0; index < petalCount; index += 1) {
    const ring = index % 3;
    const angle = (Math.PI * 2 * index) / petalCount + ring * 0.07 + pulse;
    const length = width * (0.112 + ring * 0.04);
    const breadth = height * (0.034 + ring * 0.015);
    const offset = width * (0.018 + ring * 0.023);
    const hueShift = Math.sin(index * 1.7 + time * 0.001) * 18;

    context.save();
    context.rotate(angle);
    context.translate(offset, 0);
    context.scale(1, ring === 0 ? 0.72 : 1);

    const gradient = context.createRadialGradient(length * 0.12, 0, 0, length * 0.24, 0, length);
    gradient.addColorStop(0, `hsla(${50 + hueShift}, 100%, 70%, 0.98)`);
    gradient.addColorStop(0.32, `hsla(${336 + hueShift}, 92%, 68%, 0.86)`);
    gradient.addColorStop(0.72, `hsla(${318 + hueShift}, 76%, 48%, 0.38)`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;

    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(length * 0.18, -breadth * 1.4, length * 0.82, -breadth * 1.1, length, 0);
    context.bezierCurveTo(length * 0.78, breadth * 1.18, length * 0.2, breadth * 1.22, 0, 0);
    context.closePath();
    context.fill();
    context.restore();
  }

  context.restore();

  const core = context.createRadialGradient(centerX, centerY - height * 0.035, 0, centerX, centerY, width * 0.16);
  core.addColorStop(0, "rgba(255, 244, 120, 0.98)");
  core.addColorStop(0.34, "rgba(255, 160, 66, 0.78)");
  core.addColorStop(0.74, "rgba(242, 48, 128, 0.42)");
  core.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = core;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(116, 190, 124, 0.22)";
  context.lineWidth = Math.max(2, width * 0.004);
  context.beginPath();
  context.moveTo(centerX - width * 0.018, centerY + height * 0.13);
  context.bezierCurveTo(centerX - width * 0.04, centerY + height * 0.31, centerX - width * 0.02, height * 0.92, centerX - width * 0.052, height);
  context.stroke();
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
  luma: number;
  phase: number;
}

/**
 * Renders a source image/video as a dense glyph-dot field. Moving the pointer
 * pulls nearby dots through a short-lived displacement trail while the base image
 * keeps its soft photographic color and glow.
 */
class GlyphTrailRenderer implements GlyphTrailInstance {
  readonly canvas: HTMLCanvasElement;

  private readonly ctx: CanvasRenderingContext2D;
  private readonly sampler: HTMLCanvasElement;
  private readonly samplerCtx: CanvasRenderingContext2D;
  private readonly pointer = { x: 0, y: 0, active: false };
  private readonly pointerTrail: {
    x: number;
    y: number;
    age: number;
    strength: number;
    dirX: number;
    dirY: number;
  }[] = [];
  private readonly reducedMotion: boolean;
  private readonly resizeObserver?: ResizeObserver;
  private readonly pointerMoveHandler = (event: PointerEvent) => this.onPointerMove(event);
  private readonly pointerLeaveHandler = () => {
    this.pointer.active = false;
  };

  private settings: GlyphTrailSettings;
  private source?: GlyphTrailElementSource;
  private sourceToken = 0;
  private sourceIsDynamic = false;
  private particles: Particle[] = [];
  private cols = 0;
  private rows = 0;
  private cell = 0;
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
      this.sourceIsDynamic = input instanceof HTMLVideoElement || input instanceof HTMLCanvasElement;
      this.rebuild();
      return;
    }

    void loadSource(input).then((source) => {
      if (this.destroyed || token !== this.sourceToken) {
        return;
      }
      this.source = source;
      this.sourceIsDynamic = source instanceof HTMLVideoElement;
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
      const dx = nextX - this.pointer.x;
      const dy = nextY - this.pointer.y;
      const distance = Math.hypot(dx, dy);
      const speedRef = mix(22, 5, clamp(this.settings.glitch.speed / 100, 0, 1)) * this.pixelRatio;
      const strength = clamp(distance / Math.max(speedRef, 1), 0, 1);
      if (strength > 0.02) {
        const inv = 1 / Math.max(distance, 1);
        this.pointerTrail.unshift({ x: nextX, y: nextY, age: 0, strength, dirX: dx * inv, dirY: dy * inv });
        if (this.pointerTrail.length > 28) {
          this.pointerTrail.length = 28;
        }
      }
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

    const cellCss = mix(8.2, 3.2, clamp(this.settings.glyph.scale / 120, 0, 1));
    const cell = Math.max(3, Math.round(cellCss * this.pixelRatio));
    const gap = Math.max(0.75, cell * 0.24);
    const drawSize = Math.max(1.2, cell - gap);

    const cols = Math.max(1, Math.floor(width / cell));
    const rows = Math.max(1, Math.floor(height / cell));
    this.cols = cols;
    this.rows = rows;
    this.cell = cell;

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
          luma: 0,
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
    const cutoff = 12 + (settings.dither.threshold / 100) * 88;
    const feather = 18 + (settings.dither.mix / 100) * 34;
    const scatter = (settings.dither.mix / 100) * 52;
    const mixAlpha = clamp(settings.glyph.mix / 100, 0, 1);
    const gammaCurve = mix(1.35, 0.52, clamp(settings.glyph.gamma / 100, 0, 1));

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
        const density = Math.pow(clamp((brightness + jitter) / 255, 0, 1), gammaCurve) * 255;
        const alphaGate = smoothstep(cutoff - feather, cutoff + feather * 1.25, density);

        if (a < 35 || alphaGate <= 0.018) {
          particle.baseAlpha = 0;
          particle.luma = 0;
          continue;
        }

        const color = shadeColor(r, g, b, settings);
        const nx = cols > 1 ? x / (cols - 1) : 0.5;
        const ny = rows > 1 ? y / (rows - 1) : 0.5;
        const warmCore = Math.exp(-((nx - 0.5) ** 2 / 0.026 + (ny - 0.46) ** 2 / 0.042));
        const highlightWarmth = smoothstep(0.28, 0.82, brightness / 255) * warmCore;
        if (highlightWarmth > 0.01 && settings.glyph.colorMode === "texture") {
          color[0] = Math.round(lerp(color[0], 255, highlightWarmth * 0.72));
          color[1] = Math.round(lerp(color[1], 188, highlightWarmth * 0.62));
          color[2] = Math.round(lerp(color[2], 50, highlightWarmth * 0.78));
        }
        particle.r = color[0];
        particle.g = color[1];
        particle.b = color[2];
        particle.luma = clamp(brightness / 255, 0, 1);
        particle.baseAlpha = clamp((a / 255) * mixAlpha * (0.22 + alphaGate * 0.9), 0, 1);
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

    if (this.sourceIsDynamic && this.source && isSourceReady(this.source)) {
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
    this.drawRays(width, height, time);

    const reach = mix(40, 200, clamp(settings.trail.radius / 100, 0, 1)) * this.pixelRatio;
    const reachSq = reach * reach;
    const trailStrength = clamp(settings.trail.strength / 100, 0, 1);
    const maxAge = mix(6, 34, clamp(settings.trail.tail / 100, 0, 1));
    const shimmerSpeed = 0.0012 + (settings.dither.speed / 100) * 0.003;
    const rounded = settings.glyph.preset === "organic";
    const dots = settings.glyph.preset === "dot-matrix";
    const glitchSetting = this.reducedMotion ? 0 : clamp(settings.glitch.intensity / 100, 0, 1);
    const cell = this.cell || 1;
    const dragCells = 0.18 + glitchSetting * 1.22;

    // Age the cursor trail and drop spent points. The glitch lives only along recent movement.
    for (const point of this.pointerTrail) {
      point.age += 1;
    }
    while (this.pointerTrail.length > 0) {
      const last = this.pointerTrail[this.pointerTrail.length - 1];
      if (!last || last.age <= maxAge) {
        break;
      }
      this.pointerTrail.pop();
    }

    const glitchActive = glitchSetting > 0 && trailStrength > 0 && this.pointerTrail.length > 0;

    for (const particle of this.particles) {
      if (particle.baseAlpha <= 0.01) {
        continue;
      }

      let charge = 0;
      let dirX = 0;
      let dirY = 0;
      if (glitchActive) {
        for (const point of this.pointerTrail) {
          const dx = particle.homeX - point.x;
          const dy = particle.homeY - point.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < reachSq) {
            const falloff = Math.exp(-distSq / (reachSq * 0.4));
            const ageFade = 1 - point.age / maxAge;
            const value = falloff * point.strength * ageFade;
            if (value > charge) {
              charge = value;
              dirX = point.dirX;
              dirY = point.dirY;
            }
          }
        }
        charge = clamp(charge * glitchSetting * (0.5 + trailStrength), 0, 1);
      }

      let drawX = particle.homeX;
      let drawY = particle.homeY;
      const shimmer = 0.9 + Math.sin(time * shimmerSpeed + particle.phase) * 0.1;
      const alpha = clamp(particle.baseAlpha * shimmer, 0, 1);

      if (charge > 0.01) {
        const dither = 0.5 + hash(particle.homeX * 0.5, particle.homeY * 0.5);
        const drag = charge * dragCells * dither * cell;
        const swirl = (hash(particle.homeX * 0.12, particle.homeY * 0.12) - 0.5) * Math.PI * 0.42;
        const cos = Math.cos(swirl);
        const sin = Math.sin(swirl);
        drawX = particle.homeX + (dirX * cos - dirY * sin) * drag;
        drawY = particle.homeY + (dirX * sin + dirY * cos) * drag;
      }

      ctx.globalAlpha = alpha;
      const lumaSize = mix(0.62, 1.12, Math.sqrt(particle.luma));
      const drawSize = particle.size * lumaSize;
      const inset = (particle.size - drawSize) / 2;
      fillCell(
        ctx,
        drawX + inset,
        drawY + inset,
        drawSize,
        `rgb(${particle.r},${particle.g},${particle.b})`,
        rounded,
        dots
      );
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

  private drawRays(width: number, height: number, time: number): void {
    const intensity = clamp(this.settings.glow.intensity / 100, 0, 1);
    if (intensity <= 0.02 || this.particles.length === 0) {
      return;
    }

    const ctx = this.ctx;
    const rayCount = 28;
    const span = Math.max(width, height);
    const alpha = intensity * 0.34;
    const centerX = this.centroidX;
    const centerY = this.centroidY - height * 0.03;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = `blur(${Math.max(1.1, this.pixelRatio * 1.6)}px)`;

    for (let index = 0; index < rayCount; index += 1) {
      const offset = (index - rayCount / 2) * this.cell * 0.46;
      const wave = Math.sin(time * 0.0013 + index * 0.9) * this.cell * 0.38;
      const y = centerY + offset + wave;
      const heightBand = Math.max(1, this.pixelRatio * (1.2 + (index % 4) * 0.7));
      const left = Math.max(0, centerX - span * 0.72);
      const right = Math.min(width, centerX + span * 0.12);
      const gradient = ctx.createLinearGradient(left, y, right, y);
      gradient.addColorStop(0, "rgba(255, 180, 210, 0)");
      gradient.addColorStop(0.16, `rgba(255, 170, 215, ${alpha * 0.42})`);
      gradient.addColorStop(0.48, `rgba(255, 226, 196, ${alpha})`);
      gradient.addColorStop(0.66, `rgba(255, 132, 184, ${alpha * 0.38})`);
      gradient.addColorStop(1, "rgba(255, 180, 210, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(left, y, right - left, heightBand);
    }

    ctx.restore();
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

  if (dot || rounded) {
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
