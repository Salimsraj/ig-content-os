# Hook framework

Migrated verbatim from the existing, working hook-evaluation system (`lib/hook-evaluator.ts`,
`lib/hook-rewriter.ts`). This is real, tested framework text already grounding two live features — not
new content. Phase 2 will extract this into a shared `hook-craft` skill so both files (and the new
`hook-generator`/`hook-analyzer` agents) read from one place instead of the current copy-pasted-twice
state found in the Phase 0 audit; this file is that future canonical text, staged early so it's usable
by the Chief of Staff immediately.

## Core mechanism

A hook works by opening a curiosity loop — an unanswered question in the viewer's head. Everything
below is a lever for creating or strengthening that.

## The five levers, in priority order

1. **Contrast** is the engine. Base state → end state, expectation → reality, "everyone thinks X →
   actually Y". The *size* of the gap drives curiosity, not cleverness of phrasing.
2. **Context** must land immediately — who this is for and what it's about, in the first breath, before
   curiosity can even form. Delaying context to the back half of the first sentence raises skip rate
   sharply.
3. **Specificity** beats a "hook-sounding" hook. A line that obviously performs the role of "hook"
   (generic imperative, "stop doing X") triggers ad-skepticism and gets skipped. A concrete, specific
   claim (a number, a named mechanism, a real instance) reads as information, not pitch.
4. **Proof**: any bold claim needs a proof signal closed fast (a number, a personal result) or it opens
   a worse loop: "is this even true?"
5. **Register**: match the audience's own language, not generic marketing-speak. Jargon the audience
   does not use is a skip trigger.

## Grammar underneath

Subject + Action + Objective + Contrast. e.g. "[I] [spent 2 hours on X] → [Claude did it in 2 minutes]."

## Scoring calibration (from the live evaluator)

- Skip rate under 30% = good (target).
- 30–50% = leaking.
- 50%+ = failing.
- `HIGH_SKIP = 50`, `LOW_SKIP = 30` — these thresholds are also used by the live-reel diagnosis logic in
  `app/api/instagram-content/route.ts`, so they're a cross-system convention, not just a hook-evaluation
  detail.

## Dialect handling

If the hook is in Arabic/Shami dialect with code-switching, judge it in that dialect. Do not penalize
code-switching or non-English language (see `brand.md`).

## Length constraint (from the live suggestion system)

A real hook is only what gets spoken or shown in the first 2–3 seconds: one short sentence, roughly
8–15 words. Never a multi-sentence paragraph.

## Generation grounding rule (from the live suggestion system)

When generating new hooks, model them on real reference material — sampled fresh each time from
`data/viral-hook-analysis.json` (75 real scored Arabic hooks) and `data/hook-templates.json` (999
fill-in-the-blank structural templates, 6 categories) — never invent structure from scratch, and never
translate a template's English wording word-for-word; only borrow its underlying idea. Every suggestion
must cite which numbered reference item(s) actually inspired it, validated against what was really sent
to the model (not trusted from the model's own claim) — this is what makes suggestions grounded rather
than fabricated, and that provenance check should be preserved by any future implementation.
