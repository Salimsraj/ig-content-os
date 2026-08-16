# Brand

Canonical brand identity for the Instagram Content OS. Migrated from `BRAND.md` (carousel-generator
tooling notes) and `ds-bundle/tokens/tokens.css` (the design system actually consumed by carousel
rendering), which had drifted from each other on fonts — this file is now the single source of truth;
those two keep their original narrower purposes (tooling-setup log, and machine-readable CSS tokens)
but should defer to this file if they ever disagree again.

## Visual identity

- Style: warm terracotta orange + creamy off-white ("Claude-style"), requested directly by Salim — not
  derived from a website.
- Colors: primary `#CC785C`, light `#E8A489`, dark `#9C5A42`, light bg `#F0EEE6`, light border
  `#E3DFD3`, dark bg `#1A1918`.
- Fonts: Montserrat (headings) + Inter (body).
- Machine-readable tokens: `ds-bundle/tokens/tokens.css`.

## Language / dialect

- Primary content language: Arabic, Shami dialect, with natural code-switching (English/Latin terms
  mixed in where a native speaker would actually use them).
- Do not penalize or "correct" code-switching in evaluation or generation — it's how the audience
  actually speaks (confirmed convention in the existing hook-evaluation system, see `hook-framework.md`).

## Voice / tone

*Not yet defined.* No voice/tone documentation existed anywhere in the repo prior to this knowledge
layer. To be filled in through conversation with the Chief of Staff as real preferences are confirmed —
do not infer a tone from the visual identity alone.
