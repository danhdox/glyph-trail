# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

When you make a change to `@glyph-trail/core` or `@glyph-trail/react` that should
ship in a release, add a changeset:

```bash
pnpm changeset
```

This records the affected packages and a summary of the change. At release time:

```bash
pnpm version-packages   # apply pending changesets and bump versions
pnpm release            # build and publish to npm
```

`@glyph-trail/core` and `@glyph-trail/react` are versioned together (see the
`fixed` group in `config.json`). The demo app is ignored and never published.
