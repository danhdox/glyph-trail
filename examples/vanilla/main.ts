import { createGlyphTrail } from "@glyph-trail/core";

const canvas = document.querySelector<HTMLCanvasElement>("#glyph-trail");

if (!canvas) {
  throw new Error("Missing #glyph-trail canvas.");
}

const effect = createGlyphTrail(canvas, {
  src: "/flower.jpg",
  interactive: true
});

window.addEventListener("resize", () => effect.resize());
