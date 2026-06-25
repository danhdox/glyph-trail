import { GlyphTrailCanvas } from "@glyph-trail/react";

export function Hero() {
  return (
    <section style={{ position: "relative", minHeight: "100svh", background: "#020203" }}>
      <GlyphTrailCanvas
        src="/flower.mp4"
        interactive
        settings={{
          glyph: {
            preset: "organic",
            scale: 84,
            mix: 100
          },
          trail: {
            radius: 64,
            strength: 50,
            tail: 44,
            fluidity: 36,
            chromatic: 25
          }
        }}
      />
    </section>
  );
}
