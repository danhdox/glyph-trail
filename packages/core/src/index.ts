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

export interface GlyphTrailSettings {
  adjust: AdjustSettings;
  dither: DitherSettings;
  glyph: GlyphSettings;
  trail: TrailSettings;
  glow: GlowSettings;
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

const MAX_TRAIL_POINTS = 24;

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
    intensity: 18,
    spread: 52
  }
};

export function normalizeSettings(input: GlyphTrailSettingsInput = {}): GlyphTrailSettings {
  return {
    adjust: { ...defaultSettings.adjust, ...input.adjust },
    dither: { ...defaultSettings.dither, ...input.dither },
    glyph: { ...defaultSettings.glyph, ...input.glyph },
    trail: { ...defaultSettings.trail, ...input.trail },
    glow: { ...defaultSettings.glow, ...input.glow }
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

  const centerX = width * 0.54;
  const centerY = height * 0.52;
  const petalCount = 24;
  const pulse = Math.sin(time * 0.0016) * 0.045;

  const backdrop = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.42);
  backdrop.addColorStop(0, "rgba(255, 217, 106, 0.22)");
  backdrop.addColorStop(0.28, "rgba(255, 70, 142, 0.18)");
  backdrop.addColorStop(0.66, "rgba(127, 48, 92, 0.07)");
  backdrop.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = backdrop;
  context.fillRect(0, 0, width, height);

  context.save();
  context.translate(centerX, centerY);
  context.globalCompositeOperation = "screen";

  for (let index = 0; index < petalCount; index += 1) {
    const ring = index % 3;
    const angle = (Math.PI * 2 * index) / petalCount + ring * 0.08 + pulse;
    const length = width * (0.12 + ring * 0.036);
    const breadth = height * (0.034 + ring * 0.013);
    const offset = width * (0.026 + ring * 0.018);
    const hueShift = Math.sin(index * 1.7 + time * 0.001) * 18;

    context.save();
    context.rotate(angle);
    context.translate(offset, 0);
    context.scale(1, ring === 0 ? 0.72 : 1);

    const gradient = context.createRadialGradient(length * 0.16, 0, 0, length * 0.2, 0, length);
    gradient.addColorStop(0, `hsla(${48 + hueShift}, 100%, 69%, 0.98)`);
    gradient.addColorStop(0.38, `hsla(${329 + hueShift}, 90%, 66%, 0.82)`);
    gradient.addColorStop(0.72, `hsla(${318 + hueShift}, 74%, 48%, 0.36)`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;

    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(length * 0.22, -breadth * 1.15, length * 0.82, -breadth * 1.05, length, 0);
    context.bezierCurveTo(length * 0.78, breadth * 1.18, length * 0.2, breadth * 1.1, 0, 0);
    context.closePath();
    context.fill();
    context.restore();
  }

  context.restore();

  const core = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.16);
  core.addColorStop(0, "rgba(255, 231, 108, 0.96)");
  core.addColorStop(0.35, "rgba(255, 152, 73, 0.72)");
  core.addColorStop(0.72, "rgba(243, 51, 130, 0.36)");
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

class GlyphTrailRenderer implements GlyphTrailInstance {
  readonly canvas: HTMLCanvasElement;

  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly texture: WebGLTexture;
  private readonly buffer: WebGLBuffer;
  private readonly uniforms: UniformLocations;
  private readonly trailData = new Float32Array(MAX_TRAIL_POINTS * 3);
  private readonly trailPoints: TrailPoint[] = [];
  private readonly pointerMoveHandler = (event: PointerEvent) => this.addPointerEvent(event);
  private readonly pointerLeaveHandler = () => this.fadePointer();
  private readonly resizeObserver?: ResizeObserver;

  private settings: GlyphTrailSettings;
  private source?: GlyphTrailElementSource;
  private sourceToken = 0;
  private animationFrame = 0;
  private paused = false;
  private destroyed = false;
  private lastFrameTime = 0;
  private mediaWidth = 1;
  private mediaHeight = 1;
  private pixelRatio: number;

  constructor(canvas: HTMLCanvasElement, options: GlyphTrailOptions) {
    this.canvas = canvas;
    this.pixelRatio = options.pixelRatio ?? getDevicePixelRatio();
    this.settings = normalizeSettings(options.settings);
    this.paused = options.paused ?? false;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false,
      premultipliedAlpha: false
    });

    if (!gl) {
      throw new Error("Glyph Trail requires WebGL2 support.");
    }

    this.gl = gl;
    this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    this.texture = requireResource(gl.createTexture(), "texture");
    this.buffer = requireResource(gl.createBuffer(), "buffer");
    this.uniforms = getUniformLocations(gl, this.program);

    this.setupGeometry();
    this.setupTexture();

    if (options.interactive ?? true) {
      this.canvas.addEventListener("pointermove", this.pointerMoveHandler, { passive: true });
      this.canvas.addEventListener("pointerdown", this.pointerMoveHandler, { passive: true });
      this.canvas.addEventListener("pointerleave", this.pointerLeaveHandler, { passive: true });
    }

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas);
    }

    this.updateSource(options.source ?? options.src ?? createFallbackTextureSource());
    this.resize();

    if (!this.paused || (options.autoplay ?? true)) {
      this.play();
    }
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver?.disconnect();
    this.canvas.removeEventListener("pointermove", this.pointerMoveHandler);
    this.canvas.removeEventListener("pointerdown", this.pointerMoveHandler);
    this.canvas.removeEventListener("pointerleave", this.pointerLeaveHandler);
    this.gl.deleteProgram(this.program);
    this.gl.deleteTexture(this.texture);
    this.gl.deleteBuffer(this.buffer);
  }

  resize(): void {
    const width = Math.max(1, Math.floor((this.canvas.clientWidth || this.canvas.width || 1) * this.pixelRatio));
    const height = Math.max(1, Math.floor((this.canvas.clientHeight || this.canvas.height || 1) * this.pixelRatio));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.gl.viewport(0, 0, width, height);
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
        ...this.settings,
        ...options.settings,
        adjust: { ...this.settings.adjust, ...options.settings.adjust },
        dither: { ...this.settings.dither, ...options.settings.dither },
        glyph: { ...this.settings.glyph, ...options.settings.glyph },
        trail: { ...this.settings.trail, ...options.settings.trail },
        glow: { ...this.settings.glow, ...options.settings.glow }
      });
    }

    if (options.pixelRatio !== undefined) {
      this.pixelRatio = options.pixelRatio;
      this.resize();
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

  private setupGeometry(): void {
    const gl = this.gl;
    const position = gl.getAttribLocation(this.program, "a_position");
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.useProgram(this.program);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  }

  private setupTexture(): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  }

  private updateSource(input: GlyphTrailSource): void {
    const token = ++this.sourceToken;

    if (typeof input !== "string") {
      this.source = input;
      this.updateMediaDimensions(input);
      return;
    }

    void loadSource(input).then((source) => {
      if (this.destroyed || token !== this.sourceToken) {
        return;
      }

      this.source = source;
      this.updateMediaDimensions(source);
    });
  }

  private updateMediaDimensions(source: GlyphTrailElementSource): void {
    if (source instanceof HTMLVideoElement && source.videoWidth > 0 && source.videoHeight > 0) {
      this.mediaWidth = source.videoWidth;
      this.mediaHeight = source.videoHeight;
      return;
    }

    if (source instanceof HTMLImageElement && source.naturalWidth > 0 && source.naturalHeight > 0) {
      this.mediaWidth = source.naturalWidth;
      this.mediaHeight = source.naturalHeight;
      return;
    }

    const width = "width" in source && typeof source.width === "number" ? source.width : 1;
    const height = "height" in source && typeof source.height === "number" ? source.height : 1;
    this.mediaWidth = Math.max(1, width);
    this.mediaHeight = Math.max(1, height);
  }

  private addPointerEvent(event: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0.5;
    const y = rect.height > 0 ? 1 - (event.clientY - rect.top) / rect.height : 0.5;
    const previous = this.trailPoints[0];
    const velocityX = previous ? x - previous.x : 0;
    const velocityY = previous ? y - previous.y : 0;

    this.trailPoints.unshift({ x, y, age: 0, velocityX, velocityY });
    if (this.trailPoints.length > MAX_TRAIL_POINTS) {
      this.trailPoints.length = MAX_TRAIL_POINTS;
    }
  }

  private fadePointer(): void {
    for (const point of this.trailPoints) {
      point.age = Math.max(point.age, 0.55);
    }
  }

  private render(time: number): void {
    if (this.destroyed || this.paused) {
      return;
    }

    const delta = this.lastFrameTime > 0 ? Math.min(64, time - this.lastFrameTime) : 16;
    this.lastFrameTime = time;

    this.resize();
    this.advanceTrail(delta);
    this.uploadSourceTexture();
    this.draw(time);
    this.animationFrame = requestAnimationFrame((nextTime) => this.render(nextTime));
  }

  private advanceTrail(delta: number): void {
    const tail = Math.max(1, this.settings.trail.tail);
    const dissipation = Math.max(0.15, this.settings.trail.dissipation);
    const ageStep = (delta / 1000) * (2.15 / (tail / 44)) * dissipation;

    for (const point of this.trailPoints) {
      point.age += ageStep;
    }

    while (this.trailPoints.length > 0) {
      const lastPoint = this.trailPoints[this.trailPoints.length - 1];
      if (!lastPoint || lastPoint.age <= 1.25) {
        break;
      }

      this.trailPoints.pop();
    }

    this.trailData.fill(10);
    this.trailPoints.forEach((point, index) => {
      const offset = index * 3;
      this.trailData[offset] = point.x + point.velocityX * (this.settings.trail.momentum / 100);
      this.trailData[offset + 1] = point.y + point.velocityY * (this.settings.trail.momentum / 100);
      this.trailData[offset + 2] = point.age;
    });
  }

  private uploadSourceTexture(): void {
    const gl = this.gl;
    const source = this.source;

    if (!source || !isSourceReady(source)) {
      return;
    }

    this.updateMediaDimensions(source);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    } catch {
      // Cross-origin media can fail without CORS headers. Keep the last valid frame instead of crashing.
    }
  }

  private draw(time: number): void {
    const gl = this.gl;
    const settings = this.settings;

    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uniforms.texture, 0);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.mediaResolution, this.mediaWidth, this.mediaHeight);
    gl.uniform1f(this.uniforms.time, time / 1000);
    gl.uniform1f(this.uniforms.saturation, settings.adjust.saturation);
    gl.uniform1f(this.uniforms.temperature, settings.adjust.temperature);
    gl.uniform1f(this.uniforms.contrast, settings.adjust.contrast);
    gl.uniform1f(this.uniforms.threshold, settings.dither.threshold);
    gl.uniform1f(this.uniforms.ditherMix, settings.dither.mix);
    gl.uniform1f(this.uniforms.ditherSpeed, settings.dither.speed);
    gl.uniform1f(this.uniforms.glyphScale, settings.glyph.scale);
    gl.uniform1f(this.uniforms.gamma, settings.glyph.gamma);
    gl.uniform1f(this.uniforms.phase, settings.glyph.phase);
    gl.uniform1f(this.uniforms.glyphMix, settings.glyph.mix);
    gl.uniform1i(this.uniforms.glyphPreset, glyphPresetToUniform(settings.glyph.preset));
    gl.uniform1i(this.uniforms.colorMode, colorModeToUniform(settings.glyph.colorMode));
    gl.uniform1f(this.uniforms.background, settings.glyph.background ? 1 : 0);
    gl.uniform1f(this.uniforms.trailRadius, settings.trail.radius);
    gl.uniform1f(this.uniforms.trailStrength, settings.trail.strength);
    gl.uniform1f(this.uniforms.trailHardness, settings.trail.hardness);
    gl.uniform1f(this.uniforms.fluidity, settings.trail.fluidity);
    gl.uniform1f(this.uniforms.chromatic, settings.trail.chromatic);
    gl.uniform1f(this.uniforms.noiseScale, settings.trail.noiseScale);
    gl.uniform1f(this.uniforms.glowIntensity, settings.glow.intensity);
    gl.uniform1f(this.uniforms.glowSpread, settings.glow.spread);
    gl.uniform1i(this.uniforms.trailCount, this.trailPoints.length);
    gl.uniform3fv(this.uniforms.trailPoints, this.trailData);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

interface TrailPoint {
  x: number;
  y: number;
  age: number;
  velocityX: number;
  velocityY: number;
}

interface UniformLocations {
  texture: WebGLUniformLocation;
  resolution: WebGLUniformLocation;
  mediaResolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  saturation: WebGLUniformLocation;
  temperature: WebGLUniformLocation;
  contrast: WebGLUniformLocation;
  threshold: WebGLUniformLocation;
  ditherMix: WebGLUniformLocation;
  ditherSpeed: WebGLUniformLocation;
  glyphScale: WebGLUniformLocation;
  gamma: WebGLUniformLocation;
  phase: WebGLUniformLocation;
  glyphMix: WebGLUniformLocation;
  glyphPreset: WebGLUniformLocation;
  colorMode: WebGLUniformLocation;
  background: WebGLUniformLocation;
  trailRadius: WebGLUniformLocation;
  trailStrength: WebGLUniformLocation;
  trailHardness: WebGLUniformLocation;
  fluidity: WebGLUniformLocation;
  chromatic: WebGLUniformLocation;
  noiseScale: WebGLUniformLocation;
  glowIntensity: WebGLUniformLocation;
  glowSpread: WebGLUniformLocation;
  trailCount: WebGLUniformLocation;
  trailPoints: WebGLUniformLocation;
}

function createFallbackTextureSource(): HTMLCanvasElement {
  return createDemoLotusSource(1200, 780);
}

function getDevicePixelRatio(): number {
  return typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2);
}

function glyphPresetToUniform(preset: GlyphSettings["preset"]): number {
  if (preset === "linear") {
    return 1;
  }

  if (preset === "dot-matrix") {
    return 2;
  }

  return 0;
}

function colorModeToUniform(mode: GlyphSettings["colorMode"]): number {
  if (mode === "mono") {
    return 1;
  }

  if (mode === "heat") {
    return 2;
  }

  return 0;
}

function requireResource<T>(resource: T | null, label: string): T {
  if (!resource) {
    throw new Error(`Could not create WebGL ${label}.`);
  }

  return resource;
}

function getUniformLocations(gl: WebGL2RenderingContext, program: WebGLProgram): UniformLocations {
  const uniform = (name: string) => requireResource(gl.getUniformLocation(program, name), `uniform "${name}"`);

  return {
    texture: uniform("u_texture"),
    resolution: uniform("u_resolution"),
    mediaResolution: uniform("u_mediaResolution"),
    time: uniform("u_time"),
    saturation: uniform("u_saturation"),
    temperature: uniform("u_temperature"),
    contrast: uniform("u_contrast"),
    threshold: uniform("u_threshold"),
    ditherMix: uniform("u_ditherMix"),
    ditherSpeed: uniform("u_ditherSpeed"),
    glyphScale: uniform("u_glyphScale"),
    gamma: uniform("u_gamma"),
    phase: uniform("u_phase"),
    glyphMix: uniform("u_glyphMix"),
    glyphPreset: uniform("u_glyphPreset"),
    colorMode: uniform("u_colorMode"),
    background: uniform("u_background"),
    trailRadius: uniform("u_trailRadius"),
    trailStrength: uniform("u_trailStrength"),
    trailHardness: uniform("u_trailHardness"),
    fluidity: uniform("u_fluidity"),
    chromatic: uniform("u_chromatic"),
    noiseScale: uniform("u_noiseScale"),
    glowIntensity: uniform("u_glowIntensity"),
    glowSpread: uniform("u_glowSpread"),
    trailCount: uniform("u_trailCount"),
    trailPoints: uniform("u_trailPoints")
  };
}

function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = requireResource(gl.createProgram(), "program");

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "unknown link error";
    gl.deleteProgram(program);
    throw new Error(`Could not link Glyph Trail shader program: ${log}`);
  }

  return program;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = requireResource(gl.createShader(type), "shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "unknown compile error";
    gl.deleteShader(shader);
    throw new Error(`Could not compile Glyph Trail shader: ${log}`);
  }

  return shader;
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

const vertexShaderSource = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

const int MAX_TRAIL_POINTS = ${MAX_TRAIL_POINTS};

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_mediaResolution;
uniform float u_time;
uniform float u_saturation;
uniform float u_temperature;
uniform float u_contrast;
uniform float u_threshold;
uniform float u_ditherMix;
uniform float u_ditherSpeed;
uniform float u_glyphScale;
uniform float u_gamma;
uniform float u_phase;
uniform float u_glyphMix;
uniform int u_glyphPreset;
uniform int u_colorMode;
uniform float u_background;
uniform float u_trailRadius;
uniform float u_trailStrength;
uniform float u_trailHardness;
uniform float u_fluidity;
uniform float u_chromatic;
uniform float u_noiseScale;
uniform float u_glowIntensity;
uniform float u_glowSpread;
uniform int u_trailCount;
uniform vec3 u_trailPoints[MAX_TRAIL_POINTS];

in vec2 v_uv;
out vec4 outColor;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 coverUv(vec2 uv) {
  float screenAspect = u_resolution.x / max(u_resolution.y, 1.0);
  float mediaAspect = u_mediaResolution.x / max(u_mediaResolution.y, 1.0);
  vec2 covered = uv;

  if (screenAspect > mediaAspect) {
    covered.y = (uv.y - 0.5) * (mediaAspect / screenAspect) + 0.5;
  } else {
    covered.x = (uv.x - 0.5) * (screenAspect / mediaAspect) + 0.5;
  }

  return covered;
}

vec3 adjustColor(vec3 color) {
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  float saturation = u_saturation / 100.0;
  color = mix(vec3(gray), color, saturation);

  float temperature = u_temperature / 100.0;
  color.r += temperature * 0.12;
  color.b -= temperature * 0.12;

  float contrast = u_contrast / 100.0;
  color = (color - 0.5) * (1.0 + contrast) + 0.5;
  return clamp(color, 0.0, 1.0);
}

float glyphPattern(vec2 cellUv, float density, float seed) {
  vec2 p = cellUv * 2.0 - 1.0;
  float radius = mix(0.06, 0.95, density);
  float dotShape = 1.0 - smoothstep(radius, radius + 0.08, length(p));
  float crossShape = max(
    1.0 - smoothstep(0.05, 0.18, abs(p.x)),
    1.0 - smoothstep(0.05, 0.18, abs(p.y))
  ) * smoothstep(0.12, 0.78, density);
  float slash = 1.0 - smoothstep(0.035, 0.16, abs(p.x + p.y + sin(seed * 6.2831) * 0.16));
  float ring = smoothstep(radius + 0.08, radius - 0.02, length(p)) * (1.0 - smoothstep(radius - 0.22, radius - 0.1, length(p)));
  float bars = 1.0 - smoothstep(0.02, 0.15, abs(fract((cellUv.y + seed) * 4.0) - 0.5));

  if (u_glyphPreset == 1) {
    return mix(slash, bars, step(0.55, seed)) * smoothstep(0.08, 0.92, density);
  }

  if (u_glyphPreset == 2) {
    return dotShape;
  }

  float organic = max(dotShape, max(crossShape * 0.58, max(slash * 0.46, ring * 0.62)));
  return organic;
}

vec3 colorize(vec3 color, float luma, float seed) {
  if (u_colorMode == 1) {
    return vec3(0.96, 0.94, 0.9) * (0.48 + luma * 0.88);
  }

  if (u_colorMode == 2) {
    vec3 hotA = vec3(0.22, 0.05, 0.16);
    vec3 hotB = vec3(1.0, 0.18, 0.43);
    vec3 hotC = vec3(1.0, 0.88, 0.36);
    return mix(mix(hotA, hotB, smoothstep(0.05, 0.65, luma)), hotC, smoothstep(0.55, 1.0, luma + seed * 0.1));
  }

  return color;
}

vec2 trailDisplacement(vec2 uv) {
  vec2 displacement = vec2(0.0);
  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  float radius = mix(0.018, 0.19, clamp(u_trailRadius / 100.0, 0.0, 1.0));
  float hardness = mix(2.2, 0.62, clamp(u_trailHardness / 100.0, 0.0, 1.0));
  float strength = u_trailStrength / 100.0;

  for (int index = 0; index < MAX_TRAIL_POINTS; index += 1) {
    if (index >= u_trailCount) {
      break;
    }

    vec3 trail = u_trailPoints[index];
    float age = clamp(trail.z, 0.0, 1.3);
    vec2 delta = (uv - trail.xy) * aspect;
    float distanceToTrail = length(delta);
    float influence = exp(-pow(distanceToTrail / radius, hardness)) * (1.0 - smoothstep(0.25, 1.16, age));
    vec2 direction = normalize(delta + vec2(0.0003, -0.0002));
    vec2 swirl = vec2(-direction.y, direction.x) * (u_fluidity / 100.0);
    displacement += (direction + swirl) * influence * strength * 0.026;
  }

  return displacement;
}

void main() {
  vec2 uv = v_uv;
  vec2 displacement = trailDisplacement(uv);
  float noise = hash12(floor(uv * u_resolution.xy * 0.42) + u_time * (0.4 + u_ditherSpeed * 0.035));
  displacement += (noise - 0.5) * (u_noiseScale / 100.0) * 0.012;

  float chroma = u_chromatic / 100.0 * 0.009;
  vec2 sourceUvR = coverUv(uv + displacement * 1.12 + vec2(chroma, 0.0));
  vec2 sourceUvG = coverUv(uv + displacement);
  vec2 sourceUvB = coverUv(uv + displacement * 0.86 - vec2(chroma, 0.0));

  vec3 raw;
  raw.r = texture(u_texture, sourceUvR).r;
  raw.g = texture(u_texture, sourceUvG).g;
  raw.b = texture(u_texture, sourceUvB).b;
  vec3 color = adjustColor(raw);
  float luma = dot(color, vec3(0.299, 0.587, 0.114));

  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  float cellBase = mix(18.0, 132.0, clamp(u_glyphScale / 100.0, 0.0, 1.0));
  vec2 grid = vec2(cellBase * aspect, cellBase);
  vec2 gridUv = uv * grid;
  vec2 cell = floor(gridUv);
  vec2 cellUv = fract(gridUv);
  float seed = hash12(cell + floor(u_time * (u_ditherSpeed / 100.0 + 0.2)));
  float blueNoise = hash12(cell * 1.71 + vec2(u_time * 0.9, -u_time * 0.37));
  float threshold = (u_threshold - 50.0) / 100.0;
  float gamma = mix(2.3, 0.35, clamp(u_gamma / 100.0, 0.0, 1.0));
  float density = pow(clamp(luma + (blueNoise - 0.5) * (u_ditherMix / 100.0) * 0.48 - threshold, 0.0, 1.0), gamma);
  float phase = sin((seed + u_phase / 100.0 + u_time * 0.26) * 6.28318) * 0.06;
  float glyph = glyphPattern(cellUv + phase, density, seed);
  glyph *= smoothstep(0.02, 0.22, density);

  vec3 glyphColor = colorize(color, luma, seed) * (0.52 + density * 1.22);
  vec3 background = color * 0.08 * u_background;
  vec3 dithered = mix(background, glyphColor, glyph);
  vec3 mixed = mix(color, dithered, clamp(u_glyphMix / 100.0, 0.0, 1.0));

  vec2 center = vec2(0.54, 0.54);
  float rayDistance = length((uv - center) * vec2(aspect, 1.0));
  float rayAngle = atan(uv.y - center.y, uv.x - center.x);
  float rayStripe = 0.72 + 0.28 * sin(rayAngle * 18.0 + u_time * 0.32 + noise * 2.5);
  float glow = pow(max(0.0, 1.0 - rayDistance * mix(1.65, 0.55, u_glowSpread / 100.0)), 2.4) * (u_glowIntensity / 100.0);
  mixed += vec3(1.0, 0.48, 0.84) * glow * rayStripe * 0.62;
  mixed += vec3(1.0, 0.86, 0.42) * glow * max(0.0, luma) * 0.42;

  float vignette = smoothstep(0.94, 0.28, length((uv - 0.5) * vec2(aspect * 0.72, 1.0)));
  outColor = vec4(mixed * vignette, 1.0);
}
`;
