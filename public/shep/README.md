# Shep hero artwork

Chat uses the **illustrated SVG** by default (`SHEP_HERO_USE_ILLUSTRATED` in `src/lib/shep-assets.ts`) — blinking eyes, softer expression, part-based animation.

## Single PNG (optional)

Save a composite as **`shep-hero.png`**, then set `SHEP_HERO_USE_ILLUSTRATED = false` in `src/lib/shep-assets.ts`.

## Layered PNGs (experimental)

Parts in **`layers/`** can be re-enabled later once exported from the same canvas with clean cut-outs (ears without face pixels). Layout: `src/lib/shep-hero-layout.ts`.
