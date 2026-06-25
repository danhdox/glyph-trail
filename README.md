# Glyph Trail

Interactive glyph dither and cursor-displacement effects for images and video.

Glyph Trail is a small WebGL2 renderer plus a React wrapper for turning image or video sources into responsive glyph-pixel artwork. It is designed for creative hero sections, portfolio pieces, editorial pages, and shader-art experiments.

![Glyph Trail preview](docs/preview.png)

## Features

- Framework-agnostic WebGL2 core
- React component wrapper
- Image, video, canvas, and image bitmap sources
- Blue-noise dither controls
- Organic, linear, and dot-matrix glyph presets
- Cursor trail displacement with chromatic scatter
- Subtle glow and ray pass
- Reduced-motion friendly pause API
- Tiny public API with TypeScript types

## Install

The packages are ready for npm publishing. Until the first npm release, clone the repo and run the demo locally:

```bash
git clone https://github.com/danhdox/glyph-trail.git
cd glyph-trail
pnpm install
pnpm dev
```

After publishing:

```bash
pnpm add @glyph-trail/core @glyph-trail/react
```

## React

```tsx
import { GlyphTrailCanvas } from "@glyph-trail/react";

export function Hero() {
  return (
    <GlyphTrailCanvas
      src="/flower.mp4"
      interactive
      settings={{
        adjust: { saturation: 198, temperature: -3, contrast: 100 },
        dither: { threshold: 50, mix: 50, speed: 50 },
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
        glow: { intensity: 18, spread: 52 }
      }}
    />
  );
}
```

## Vanilla

```ts
import { createGlyphTrail } from "@glyph-trail/core";

const canvas = document.querySelector<HTMLCanvasElement>("#glyph-trail");

if (canvas) {
  const effect = createGlyphTrail(canvas, {
    src: "/flower.jpg",
    interactive: true
  });

  window.addEventListener("resize", () => effect.resize());
}
```

## Demo

```bash
pnpm install
pnpm dev
```

Then open the Vite URL and move the cursor over the flower. The demo includes live controls, presets, and a copyable React snippet.

## Browser Support

Glyph Trail requires WebGL2. It is expected to work in current Chromium, Firefox, and Safari releases that expose WebGL2.

## Accessibility

Glyph Trail is a visual effect. Keep meaningful text and controls in normal HTML, not inside the canvas. For reduced-motion contexts, pause the animation or lower trail strength:

```tsx
<GlyphTrailCanvas paused={window.matchMedia("(prefers-reduced-motion: reduce)").matches} />
```

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Project Status

This is an early open-source release. The current goal is a stable creative-coding API and a polished demo before expanding into npm publishing, richer glyph atlases, and framework examples.

## License

MIT
