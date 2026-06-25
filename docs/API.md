# API

## `createGlyphTrail(canvas, options)`

Creates a WebGL2 renderer bound to an existing canvas.

```ts
import { createGlyphTrail } from "@glyph-trail/core";

const effect = createGlyphTrail(canvas, {
  src: "/flower.mp4",
  interactive: true
});
```

Returns:

```ts
interface GlyphTrailInstance {
  canvas: HTMLCanvasElement;
  destroy(): void;
  resize(): void;
  pause(): void;
  play(): void;
  update(options: Partial<GlyphTrailOptions>): void;
}
```

## Sources

`src` or `source` accepts:

- image URL
- video URL
- `HTMLImageElement`
- `HTMLVideoElement`
- `HTMLCanvasElement`
- `ImageBitmap`
- `OffscreenCanvas`

String URLs ending in `mp4`, `webm`, `ogv`, or `mov` are loaded as videos. Other string URLs are loaded as images.

## Settings

All settings are optional and merged with defaults.

```ts
interface GlyphTrailSettings {
  adjust: {
    saturation: number;
    temperature: number;
    contrast: number;
  };
  dither: {
    threshold: number;
    mix: number;
    speed: number;
  };
  glyph: {
    preset: "organic" | "linear" | "dot-matrix";
    scale: number;
    gamma: number;
    phase: number;
    mix: number;
    colorMode: "texture" | "mono" | "heat";
    background: boolean;
  };
  trail: {
    radius: number;
    strength: number;
    hardness: number;
    tail: number;
    fluidity: number;
    dissipation: number;
    chromatic: number;
    momentum: number;
    noiseScale: number;
  };
  glow: {
    intensity: number;
    spread: number;
  };
}
```

## React

```tsx
import { GlyphTrailCanvas } from "@glyph-trail/react";

<GlyphTrailCanvas src="/flower.mp4" interactive />;
```

The component exposes an imperative ref:

```tsx
const ref = useRef<GlyphTrailCanvasHandle>(null);

ref.current?.pause();
ref.current?.play();
ref.current?.resize();
```
