import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from "react";
import {
  createGlyphTrail,
  type GlyphTrailInstance,
  type GlyphTrailOptions,
  type GlyphTrailSettingsInput,
  type GlyphTrailSource
} from "@glyph-trail/core";

export interface GlyphTrailCanvasHandle {
  canvas: HTMLCanvasElement | null;
  instance: GlyphTrailInstance | null;
  pause(): void;
  play(): void;
  resize(): void;
}

export interface GlyphTrailCanvasProps
  extends Omit<HTMLAttributes<HTMLCanvasElement>, "children" | "ref" | "onError"> {
  src?: GlyphTrailSource;
  source?: GlyphTrailSource;
  settings?: GlyphTrailSettingsInput;
  interactive?: boolean;
  autoplay?: boolean;
  paused?: boolean;
  pixelRatio?: number;
  onError?: (error: unknown) => void;
}

export const GlyphTrailCanvas = forwardRef<GlyphTrailCanvasHandle, GlyphTrailCanvasProps>(function GlyphTrailCanvas(
  {
    src,
    source,
    settings,
    interactive = true,
    autoplay = true,
    paused = false,
    pixelRatio,
    onError,
    style,
    ...canvasProps
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instanceRef = useRef<GlyphTrailInstance | null>(null);

  const buildOptions = (): GlyphTrailOptions => {
    const options: GlyphTrailOptions = {
      interactive,
      autoplay,
      paused
    };

    if (src !== undefined) {
      options.src = src;
    }

    if (source !== undefined) {
      options.source = source;
    }

    if (settings !== undefined) {
      options.settings = settings;
    }

    if (pixelRatio !== undefined) {
      options.pixelRatio = pixelRatio;
    }

    return options;
  };

  useImperativeHandle(
    ref,
    () => ({
      get canvas() {
        return canvasRef.current;
      },
      get instance() {
        return instanceRef.current;
      },
      pause() {
        instanceRef.current?.pause();
      },
      play() {
        instanceRef.current?.play();
      },
      resize() {
        instanceRef.current?.resize();
      }
    }),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    try {
      instanceRef.current = createGlyphTrail(canvas, buildOptions());
    } catch (error) {
      onError?.(error);
    }

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    instanceRef.current?.update(buildOptions());
  }, [source, src, settings, interactive, autoplay, paused, pixelRatio]);

  const canvasStyle: CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    ...style
  };

  return <canvas {...canvasProps} ref={canvasRef} style={canvasStyle} />;
});

export type {
  AdjustSettings,
  DitherSettings,
  GlowSettings,
  GlyphSettings,
  GlyphTrailInstance,
  GlyphTrailOptions,
  GlyphTrailSettings,
  GlyphTrailSettingsInput,
  GlyphTrailSource,
  TrailSettings
} from "@glyph-trail/core";
