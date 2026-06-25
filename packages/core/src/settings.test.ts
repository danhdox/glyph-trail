import { describe, expect, it } from "vitest";
import { defaultSettings, normalizeSettings } from "./index";

describe("normalizeSettings", () => {
  it("keeps defaults for untouched groups", () => {
    const settings = normalizeSettings({
      glyph: {
        scale: 42
      }
    });

    expect(settings.glyph.scale).toBe(42);
    expect(settings.trail.radius).toBe(defaultSettings.trail.radius);
    expect(settings.adjust.saturation).toBe(defaultSettings.adjust.saturation);
  });

  it("does not mutate default settings", () => {
    const settings = normalizeSettings({
      trail: {
        strength: 12
      }
    });

    settings.trail.strength = 88;
    expect(defaultSettings.trail.strength).toBe(50);
  });
});
