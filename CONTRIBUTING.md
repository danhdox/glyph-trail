# Contributing

Thanks for helping improve Glyph Trail.

## Local Setup

```bash
pnpm install
pnpm dev
```

## Checks

Run these before opening a pull request:

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Pull Requests

- Keep rendering changes small enough to review.
- Include before/after screenshots or recordings for visual changes.
- Mention browser and device coverage for WebGL changes.
- Avoid adding heavyweight runtime dependencies to the core package.

## Good First Areas

- More framework examples
- More glyph presets
- Better reduced-motion defaults
- Performance measurements across browser/GPU combinations
