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
  if (typeof WebGL2RenderingContext !== "undefined") {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: false
    });

    if (gl) {
      return new WebGLGlyphTrailRenderer(canvas, options, gl);
    }
  }

  return new CanvasGlyphTrailRenderer(canvas, options);
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

const MAX_WEBGL_TRAIL_POINTS = 28;

interface PointerTrailPoint {
  x: number;
  y: number;
  age: number;
  strength: number;
  dirX: number;
  dirY: number;
}

interface WebGLUniforms {
  source: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
  sourceSize: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  adjust: WebGLUniformLocation | null;
  dither: WebGLUniformLocation | null;
  glyph: WebGLUniformLocation | null;
  trailSettings: WebGLUniformLocation | null;
  glowSettings: WebGLUniformLocation | null;
  noiseSettings: WebGLUniformLocation | null;
  trailCount: WebGLUniformLocation | null;
  trail: (WebGLUniformLocation | null)[];
  trailDir: (WebGLUniformLocation | null)[];
}

const WEBGL_VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const WEBGL_FRAGMENT_SHADER = `#version 300 es
precision highp float;

#define MAX_TRAIL 28

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uSourceSize;
uniform float uTime;
uniform vec4 uAdjust;
uniform vec4 uDither;
uniform vec4 uGlyph;
uniform vec4 uTrailSettings;
uniform vec4 uGlowSettings;
uniform vec4 uNoiseSettings;
uniform int uTrailCount;
uniform vec4 uTrail[MAX_TRAIL];
uniform vec2 uTrailDir[MAX_TRAIL];

in vec2 vUv;
out vec4 outColor;

float saturate(float value) {
  return clamp(value, 0.0, 1.0);
}

vec2 saturate(vec2 value) {
  return clamp(value, vec2(0.0), vec2(1.0));
}

vec3 saturate(vec3 value) {
  return clamp(value, vec3(0.0), vec3(1.0));
}

float luminance(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float hash21(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 point) {
  vec2 base = floor(point);
  vec2 local = fract(point);
  vec2 fade = local * local * (3.0 - 2.0 * local);
  float a = hash21(base);
  float b = hash21(base + vec2(1.0, 0.0));
  float c = hash21(base + vec2(0.0, 1.0));
  float d = hash21(base + vec2(1.0, 1.0));
  return mix(mix(a, b, fade.x), mix(c, d, fade.x), fade.y);
}

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

vec2 coverUv(vec2 uv) {
  float sourceAspect = uSourceSize.x / max(uSourceSize.y, 1.0);
  float targetAspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 mapped = uv;

  if (sourceAspect > targetAspect) {
    float scale = targetAspect / sourceAspect;
    mapped.x = (uv.x - 0.5) * scale + 0.5;
  } else {
    float scale = sourceAspect / targetAspect;
    mapped.y = (uv.y - 0.5) * scale + 0.5;
  }

  return mapped;
}

vec4 readSource(vec2 uv) {
  vec2 mapped = coverUv(uv);
  if (mapped.x < 0.0 || mapped.y < 0.0 || mapped.x > 1.0 || mapped.y > 1.0) {
    return vec4(0.0);
  }

  return texture(uSource, mapped);
}

float sourceMask(vec4 sampleColor) {
  float luma = luminance(sampleColor.rgb);
  float blackKey = smoothstep(0.018, 0.15, max(max(sampleColor.r, sampleColor.g), sampleColor.b));
  float petalKey = smoothstep(0.05, 0.32, sampleColor.r - sampleColor.g * 0.42);
  float warmKey = smoothstep(0.08, 0.28, sampleColor.r - sampleColor.b * 0.3);
  float flowerKey = max(petalKey, warmKey * 0.78);
  return sampleColor.a < 0.99 ? sampleColor.a : blackKey * flowerKey * smoothstep(0.035, 0.14, luma);
}

vec3 adjustColor(vec3 color) {
  float gray = luminance(color);
  float saturation = uAdjust.x / 100.0;
  color = vec3(gray) + (color - vec3(gray)) * saturation;
  float temperature = uAdjust.y / 100.0;
  color.r += temperature * 0.12;
  color.b -= temperature * 0.12;
  float contrast = 1.0 + uAdjust.z / 100.0;
  color = (color - 0.5) * contrast + 0.5;
  return saturate(color);
}

vec3 gradeColor(vec3 sourceColor, vec2 uv, float luma, float mask) {
  vec3 adjusted = adjustColor(sourceColor);
  float core = exp(-((uv.x - 0.51) * (uv.x - 0.51) / 0.012 + (uv.y - 0.51) * (uv.y - 0.51) / 0.028));
  float coreHeat = core * smoothstep(0.18, 0.85, luma + mask * 0.22);
  float petalNoise = noise(uv * vec2(9.0, 5.0) + uTime * 0.05);
  vec3 petal = mix(vec3(1.0, 0.18, 0.58), vec3(0.98, 0.08, 0.82), petalNoise);
  vec3 warm = mix(vec3(1.0, 0.48, 0.06), vec3(1.0, 0.9, 0.22), smoothstep(0.35, 1.0, luma + core * 0.35));
  vec3 heat = mix(petal * (0.68 + luma * 0.92), warm, coreHeat);

  if (uGlyph.w > 1.5) {
    float mono = saturate(0.42 + luma * 1.1);
    return vec3(0.95, 0.92, 0.86) * mono;
  }

  if (uGlyph.w > 0.5) {
    return heat;
  }

  return mix(adjusted, heat, 0.96);
}

vec2 velocityDisplace(vec2 uv) {
  if (uTrailCount <= 0) {
    return vec2(0.0);
  }

  vec2 pixel = uv * uResolution;
  float radius = mix(72.0, 148.0, saturate(uTrailSettings.x / 100.0));
  float force = mix(0.38, 0.95, saturate(uTrailSettings.y / 100.0));
  float fluidity = saturate(uTrailSettings.w / 100.0);
  float glitch = saturate(uGlowSettings.z / 100.0);
  float chromatic = saturate(uGlowSettings.w / 100.0);
  float noiseScale = mix(1.8, 5.4, saturate(uNoiseSettings.x / 100.0));
  vec2 displacement = vec2(0.0);

  for (int index = 0; index < MAX_TRAIL; index += 1) {
    if (index >= uTrailCount) {
      break;
    }

    vec4 point = uTrail[index];
    vec2 pointPixel = point.xy * uResolution;
    vec2 delta = pixel - pointPixel;
    float distSq = dot(delta, delta);
    float falloff = exp(-distSq / max(radius * radius * 0.42, 1.0));
    float curl = (noise(uv * noiseScale + vec2(float(index) * 7.31, uTime * 0.55)) - 0.5) * 1.25 * fluidity;
    vec2 dir = rotate2d(curl) * normalize(uTrailDir[index] + vec2(0.0001));
    displacement += dir * falloff * point.z * point.w * force * mix(6.0, 18.0, glitch) * (1.0 + chromatic * 0.18);
  }

  return displacement / uResolution;
}

vec3 emissiveSample(vec2 uv) {
  vec2 displaced = uv + velocityDisplace(uv) * 0.42;
  vec4 sampleColor = readSource(displaced);
  float mask = sourceMask(sampleColor);
  if (mask <= 0.001) {
    return vec3(0.0);
  }

  float luma = luminance(sampleColor.rgb);
  vec3 color = gradeColor(sampleColor.rgb, uv, luma, mask);
  float core = exp(-((uv.x - 0.51) * (uv.x - 0.51) / 0.012 + (uv.y - 0.51) * (uv.y - 0.51) / 0.028));
  float emission = smoothstep(0.05, 0.82, max(luma, mask * 0.62)) * mask * (1.08 + core * 2.2);
  return color * emission * 1.08;
}

vec3 bloomPass(vec2 uv) {
  float spread = saturate(uGlowSettings.y / 100.0);
  float base = mix(8.0, 48.0, spread);
  vec2 px = 1.0 / uResolution;
  vec3 bloom = emissiveSample(uv) * 0.3;

  bloom += emissiveSample(uv + vec2(base, 0.0) * px) * 0.13;
  bloom += emissiveSample(uv - vec2(base, 0.0) * px) * 0.13;
  bloom += emissiveSample(uv + vec2(0.0, base) * px) * 0.11;
  bloom += emissiveSample(uv - vec2(0.0, base) * px) * 0.11;
  bloom += emissiveSample(uv + vec2(base * 2.3, base * 0.5) * px) * 0.08;
  bloom += emissiveSample(uv - vec2(base * 2.3, base * 0.5) * px) * 0.08;
  return bloom;
}

vec3 rayPass(vec2 uv) {
  float intensity = saturate(uGlowSettings.x / 100.0);
  if (intensity <= 0.001) {
    return vec3(0.0);
  }

  float lengthPx = mix(150.0, 350.0, saturate(uGlowSettings.y / 100.0));
  vec3 rays = vec3(0.0);
  float total = 0.0;

  for (int index = 1; index <= 20; index += 1) {
    float t = float(index) / 20.0;
    float jitter = (noise(vec2(uv.y * 120.0, float(index) * 3.7 + uTime * 0.25)) - 0.5) * mix(0.3, 0.9, intensity);
    vec2 rayUv = uv + vec2(t * lengthPx / uResolution.x, jitter / uResolution.y);
    if (rayUv.x > 1.0) {
      continue;
    }

    vec3 emission = emissiveSample(rayUv);
    float energy = luminance(emission);
    float decay = pow(mix(0.92, 0.96, intensity), float(index));
    float weight = smoothstep(0.06, 0.9, energy) * decay;
    rays += emission * weight;
    total += weight;
  }

  if (total > 0.0) {
    rays /= 6.0;
  }

  return rays * intensity * 0.76;
}

vec4 halftonePass(vec2 uv) {
  float preset = uGlyph.w;
  float angle = preset > 1.5 ? 0.0 : (preset > 0.5 ? -0.055 : 0.095);
  mat2 rotation = rotate2d(angle);
  mat2 inverseRotation = rotate2d(-angle);
  vec2 center = uResolution * 0.5;
  float cell = mix(8.0, 2.7, saturate(uGlyph.x / 120.0));
  vec2 rotatedPixel = rotation * (uv * uResolution - center) + center;
  vec2 grid = rotatedPixel / cell;
  vec2 cellId = floor(grid);
  float ditherMix = saturate(uDither.y / 100.0);
  vec2 jitter = (vec2(hash21(cellId + 13.1), hash21(cellId + 71.7)) - 0.5) * mix(0.12, 0.25, ditherMix);
  vec2 local = fract(grid) - 0.5 - jitter;
  vec2 cellPixel = inverseRotation * (((cellId + 0.5 + jitter) * cell) - center) + center;
  vec2 cellUv = cellPixel / uResolution;
  vec2 displacementUv = velocityDisplace(cellUv);
  local -= (rotation * (displacementUv * uResolution)) / cell * 0.68;
  vec2 displacedUv = cellUv + displacementUv * 0.62;
  vec4 sampleColor = readSource(displacedUv);
  float mask = sourceMask(sampleColor);
  float sourceLuma = luminance(sampleColor.rgb);
  float density = pow(saturate(max(sourceLuma * 1.22, mask * 0.72)), mix(1.35, 0.52, saturate(uGlyph.y / 100.0)));
  float animatedNoise = (hash21(cellId * 1.83 + floor(uTime * mix(0.25, 2.2, saturate(uDither.z / 100.0)))) - 0.5) * 0.08 * ditherMix;
  float threshold = mix(0.18, 0.48, saturate(uDither.x / 100.0));
  float feather = mix(0.035, 0.085, ditherMix);
  float alphaGate = smoothstep(threshold - feather, threshold + feather, density + animatedNoise);

  if (mask <= 0.001 || alphaGate <= 0.001) {
    return vec4(0.0);
  }

  float dist = length(local * cell);
  float radius = cell * mix(0.14, 0.62, sqrt(saturate(density))) * mix(0.72, 1.08, saturate(uGlyph.z / 100.0));
  float shape = 1.0 - smoothstep(radius - 0.55, radius + 0.55, dist);

  if (preset > 0.5 && preset < 1.5) {
    float stripe = 1.0 - smoothstep(radius * 0.38, radius * 0.38 + 0.55, abs(local.y * cell));
    shape = max(shape * 0.62, stripe * smoothstep(radius * 1.9, radius * 0.35, abs(local.x * cell)));
  }

  float shimmer = 0.92 + sin(uTime * mix(0.7, 2.6, saturate(uDither.z / 100.0)) + hash21(cellId) * 6.2831853) * 0.08;
  vec3 color = gradeColor(sampleColor.rgb, cellUv, sourceLuma, mask);
  float core = exp(-((cellUv.x - 0.51) * (cellUv.x - 0.51) / 0.012 + (cellUv.y - 0.51) * (cellUv.y - 0.51) / 0.028));
  color *= 1.22 + core * 1.35;
  float alpha = saturate(shape * alphaGate * mask * saturate(uGlyph.z / 100.0) * shimmer * 1.08);
  return vec4(color * alpha, alpha);
}

void main() {
  vec2 uv = saturate(vUv);
  vec4 halftone = halftonePass(uv);
  float glow = saturate(uGlowSettings.x / 100.0);
  vec3 bloom = bloomPass(uv) * glow * 0.44;
  vec3 rays = rayPass(uv);
  float vignette = smoothstep(0.98, 0.28, length((uv - 0.5) * vec2(1.06, 1.0)));
  vec3 color = halftone.rgb + bloom + rays;
  color *= 0.86 + vignette * 0.18;
  color = color / (vec3(1.0) + color * 0.55);
  color *= 1.08;
  color = pow(max(color, vec3(0.0)), vec3(0.92));
  outColor = vec4(color, 1.0);
}
`;

class WebGLGlyphTrailRenderer implements GlyphTrailInstance {
  readonly canvas: HTMLCanvasElement;

  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly positionBuffer: WebGLBuffer;
  private readonly sourceTexture: WebGLTexture;
  private readonly uniforms: WebGLUniforms;
  private readonly pointer = { x: 0, y: 0, active: false };
  private readonly pointerTrail: PointerTrailPoint[] = [];
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
  private animationFrame = 0;
  private paused = false;
  private destroyed = false;
  private pixelRatio: number;
  private interactive: boolean;
  private sourceWidth = 1;
  private sourceHeight = 1;
  private needsTextureUpload = false;

  constructor(canvas: HTMLCanvasElement, options: GlyphTrailOptions, gl: WebGL2RenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
    this.settings = normalizeSettings(options.settings);
    this.pixelRatio = options.pixelRatio ?? getWebGLPixelRatio();
    this.paused = options.paused ?? false;
    this.interactive = options.interactive ?? true;
    this.reducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const program = createWebGLProgram(gl, WEBGL_VERTEX_SHADER, WEBGL_FRAGMENT_SHADER);
    const positionBuffer = gl.createBuffer();
    const sourceTexture = gl.createTexture();
    if (!positionBuffer || !sourceTexture) {
      throw new Error("Glyph Trail could not allocate WebGL resources.");
    }

    this.program = program;
    this.positionBuffer = positionBuffer;
    this.sourceTexture = sourceTexture;
    this.uniforms = getWebGLUniforms(gl, program);

    this.setupGeometry();
    this.setupTexture();

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

    this.rebuild();
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
    this.gl.deleteBuffer(this.positionBuffer);
    this.gl.deleteTexture(this.sourceTexture);
    this.gl.deleteProgram(this.program);
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
      this.renderStaticFrame();
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
      this.renderStaticFrame();
    } else if (options.paused === false) {
      this.play();
    }
  }

  private setupGeometry(): void {
    const gl = this.gl;
    const positionLocation = gl.getAttribLocation(this.program, "aPosition");
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  }

  private setupTexture(): void {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    setUniform1i(gl, this.uniforms.source, 0);
  }

  private updateSource(input: GlyphTrailSource): void {
    const token = ++this.sourceToken;

    if (typeof input !== "string") {
      this.source = input;
      this.sourceIsDynamic = isDynamicSource(input);
      this.sourceWidth = getMediaWidth(input);
      this.sourceHeight = getMediaHeight(input);
      this.needsTextureUpload = true;
      this.rebuild();
      return;
    }

    void loadSource(input).then((source) => {
      if (this.destroyed || token !== this.sourceToken) {
        return;
      }
      this.source = source;
      this.sourceIsDynamic = isDynamicSource(source);
      this.sourceWidth = getMediaWidth(source);
      this.sourceHeight = getMediaHeight(source);
      this.needsTextureUpload = true;
      this.rebuild();
    });
  }

  private onPointerMove(event: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const nextX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const nextY = 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1);
    if (this.pointer.active) {
      const dx = (nextX - this.pointer.x) * this.canvas.width;
      const dy = (nextY - this.pointer.y) * this.canvas.height;
      const distance = Math.hypot(dx, dy);
      const speedRef = mix(18, 5, clamp(this.settings.glitch.speed / 100, 0, 1)) * this.pixelRatio;
      const strength = clamp(distance / Math.max(speedRef, 1), 0, 1);
      if (strength > 0.015) {
        const inv = 1 / Math.max(distance, 1);
        this.pointerTrail.unshift({ x: nextX, y: nextY, age: 0, strength, dirX: dx * inv, dirY: dy * inv });
        if (this.pointerTrail.length > MAX_WEBGL_TRAIL_POINTS) {
          this.pointerTrail.length = MAX_WEBGL_TRAIL_POINTS;
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

    this.gl.viewport(0, 0, width, height);
    this.uploadTextureIfNeeded();

    if (this.paused) {
      this.renderStaticFrame();
    }
  }

  private uploadTextureIfNeeded(): void {
    const source = this.source;
    if (!source || !isSourceReady(source) || (!this.needsTextureUpload && !this.sourceIsDynamic)) {
      return;
    }

    const gl = this.gl;
    try {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      this.sourceWidth = getMediaWidth(source);
      this.sourceHeight = getMediaHeight(source);
      this.needsTextureUpload = false;
    } catch {
      // Cross-origin media without CORS headers cannot be sampled. Keep the previous texture.
    }
  }

  private renderStaticFrame(): void {
    if (this.destroyed) {
      return;
    }
    this.draw(0);
  }

  private render(time: number): void {
    if (this.destroyed || this.paused) {
      return;
    }

    this.draw(time);
    this.animationFrame = requestAnimationFrame((next) => this.render(next));
  }

  private draw(time: number): void {
    const gl = this.gl;
    const settings = this.settings;
    this.uploadTextureIfNeeded();
    this.ageTrail();

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
    gl.clearColor(0.005, 0.005, 0.008, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    setUniform2f(gl, this.uniforms.resolution, this.canvas.width, this.canvas.height);
    setUniform2f(gl, this.uniforms.sourceSize, this.sourceWidth, this.sourceHeight);
    setUniform1f(gl, this.uniforms.time, this.reducedMotion ? 0 : time * 0.001);
    setUniform4f(
      gl,
      this.uniforms.adjust,
      settings.adjust.saturation,
      settings.adjust.temperature,
      settings.adjust.contrast,
      0
    );
    setUniform4f(
      gl,
      this.uniforms.dither,
      settings.dither.threshold,
      settings.dither.mix,
      settings.dither.speed,
      0
    );
    setUniform4f(
      gl,
      this.uniforms.glyph,
      settings.glyph.scale,
      settings.glyph.gamma,
      settings.glyph.mix,
      glyphPresetToNumber(settings.glyph.preset, settings.glyph.colorMode)
    );
    setUniform4f(
      gl,
      this.uniforms.trailSettings,
      settings.trail.radius,
      settings.trail.strength,
      settings.trail.tail,
      settings.trail.fluidity
    );
    setUniform4f(
      gl,
      this.uniforms.glowSettings,
      settings.glow.intensity,
      settings.glow.spread,
      this.reducedMotion ? 0 : settings.glitch.intensity,
      settings.trail.chromatic
    );
    setUniform4f(gl, this.uniforms.noiseSettings, settings.trail.noiseScale, settings.trail.momentum, 0, 0);
    this.uploadTrailUniforms();

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private ageTrail(): void {
    const maxAge = mix(8, 42, clamp(this.settings.trail.tail / 100, 0, 1));
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
  }

  private uploadTrailUniforms(): void {
    const gl = this.gl;
    const maxAge = mix(8, 42, clamp(this.settings.trail.tail / 100, 0, 1));
    const count = Math.min(this.pointerTrail.length, MAX_WEBGL_TRAIL_POINTS);
    setUniform1i(gl, this.uniforms.trailCount, count);

    for (let index = 0; index < MAX_WEBGL_TRAIL_POINTS; index += 1) {
      const point = this.pointerTrail[index];
      const trailLocation = this.uniforms.trail[index] ?? null;
      const dirLocation = this.uniforms.trailDir[index] ?? null;

      if (index < count && point) {
        const ageFade = clamp(1 - point.age / Math.max(maxAge, 1), 0, 1);
        setUniform4f(gl, trailLocation, point.x, point.y, point.strength, ageFade);
        setUniform2f(gl, dirLocation, point.dirX, point.dirY);
      } else {
        setUniform4f(gl, trailLocation, 0, 0, 0, 0);
        setUniform2f(gl, dirLocation, 0, 0);
      }
    }
  }
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
class CanvasGlyphTrailRenderer implements GlyphTrailInstance {
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

    this.rebuild();
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

function createWebGLProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
  const vertexShader = compileWebGLShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileWebGLShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Glyph Trail could not create a WebGL program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS) as boolean;
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!linked) {
    const message = gl.getProgramInfoLog(program) || "Unknown WebGL program link error.";
    gl.deleteProgram(program);
    throw new Error(`Glyph Trail WebGL program failed to link: ${message}`);
  }

  return program;
}

function compileWebGLShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Glyph Trail could not create a WebGL shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS) as boolean;
  if (!compiled) {
    const message = gl.getShaderInfoLog(shader) || "Unknown WebGL shader compile error.";
    gl.deleteShader(shader);
    throw new Error(`Glyph Trail WebGL shader failed to compile: ${message}`);
  }

  return shader;
}

function getWebGLUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): WebGLUniforms {
  return {
    source: gl.getUniformLocation(program, "uSource"),
    resolution: gl.getUniformLocation(program, "uResolution"),
    sourceSize: gl.getUniformLocation(program, "uSourceSize"),
    time: gl.getUniformLocation(program, "uTime"),
    adjust: gl.getUniformLocation(program, "uAdjust"),
    dither: gl.getUniformLocation(program, "uDither"),
    glyph: gl.getUniformLocation(program, "uGlyph"),
    trailSettings: gl.getUniformLocation(program, "uTrailSettings"),
    glowSettings: gl.getUniformLocation(program, "uGlowSettings"),
    noiseSettings: gl.getUniformLocation(program, "uNoiseSettings"),
    trailCount: gl.getUniformLocation(program, "uTrailCount"),
    trail: Array.from({ length: MAX_WEBGL_TRAIL_POINTS }, (_, index) =>
      gl.getUniformLocation(program, `uTrail[${index}]`)
    ),
    trailDir: Array.from({ length: MAX_WEBGL_TRAIL_POINTS }, (_, index) =>
      gl.getUniformLocation(program, `uTrailDir[${index}]`)
    )
  };
}

function setUniform1f(gl: WebGL2RenderingContext, location: WebGLUniformLocation | null, x: number): void {
  if (location) {
    gl.uniform1f(location, x);
  }
}

function setUniform1i(gl: WebGL2RenderingContext, location: WebGLUniformLocation | null, x: number): void {
  if (location) {
    gl.uniform1i(location, x);
  }
}

function setUniform2f(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null,
  x: number,
  y: number
): void {
  if (location) {
    gl.uniform2f(location, x, y);
  }
}

function setUniform4f(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null,
  x: number,
  y: number,
  z: number,
  w: number
): void {
  if (location) {
    gl.uniform4f(location, x, y, z, w);
  }
}

function glyphPresetToNumber(preset: GlyphSettings["preset"], colorMode: GlyphSettings["colorMode"]): number {
  if (colorMode === "mono") {
    return 2;
  }

  if (colorMode === "heat" || preset === "linear") {
    return 1;
  }

  if (preset === "dot-matrix") {
    return 2;
  }

  return 0;
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

function isDynamicSource(source: GlyphTrailElementSource): boolean {
  if (source instanceof HTMLVideoElement || source instanceof HTMLCanvasElement) {
    return true;
  }

  return typeof OffscreenCanvas !== "undefined" && source instanceof OffscreenCanvas;
}

function createFallbackTextureSource(): HTMLCanvasElement {
  return createDemoLotusSource(1200, 780);
}

function getDevicePixelRatio(): number {
  return typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2);
}

function getWebGLPixelRatio(): number {
  return typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 1.35);
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
    const ready = new Promise<void>((resolve, reject) => {
      video.addEventListener("loadeddata", () => resolve(), { once: true });
      video.addEventListener("error", () => reject(new Error(`Could not load video source: ${src}`)), { once: true });
    });
    video.src = src;
    video.load();

    await ready;

    await video.play().catch(() => undefined);
    return video;
  }

  const image = new Image();
  image.crossOrigin = "anonymous";
  const ready = new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => reject(new Error(`Could not load image source: ${src}`)), { once: true });
  });
  image.src = src;

  await ready;

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
