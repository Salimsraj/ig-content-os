# Knowledge Layer

Canonical, AI-readable source of truth for brand, voice, audience, craft standards, and accumulated
performance learnings across the Instagram Content OS. Every skill and agent reads from here before
producing content. This is the single place that should change when a durable preference or learning
is confirmed — not scattered across individual skill files or code comments.

## Files

| File | Purpose | Status as of Phase 1 |
|---|---|---|
| `brand.md` | Visual identity, tone, dialect | Migrated from existing `BRAND.md` / `ds-bundle` |
| `audience.md` | Who the content is for | Empty scaffold — nothing existed in the repo to migrate |
| `positioning.md` | What this account stands for vs. alternatives | Empty scaffold |
| `content-pillars.md` | Recurring content themes/categories | Empty scaffold |
| `offers.md` | What (if anything) this account sells/promotes | Empty scaffold |
| `hook-framework.md` | The 5-lever hook-scoring/writing framework | Migrated verbatim from `lib/hook-evaluator.ts` |
| `reel-style.md` | Reel structure, pacing, dialect conventions | Partially populated from known facts; rest is scaffold |
| `video-editing-style.md` | Cut pacing, punch-ins, B-roll, music treatment | Empty scaffold — no video editing exists yet (Phase 4) |
| `caption-style.md` | IG caption voice and structure | Empty scaffold — no caption tooling exists yet (Phase 5) |
| `cta-rules.md` | When/how to ask for follows, comments, saves, etc. | Empty scaffold |
| `performance-learnings.md` | Accumulated learnings from what worked/didn't | Seeded empty — populated by the performance-analyst agent (Phase 7) |

## Rules for agents/skills

1. **Read before writing.** Before generating hooks, scripts, captions, or edits, read the relevant
   knowledge file(s) so output reflects confirmed brand/voice/style, not generic defaults.
2. **Write only durable, confirmed things.** A one-off preference mentioned in passing is not a
   learning. Only persist something here once it's been confirmed as a standing preference or backed
   by real performance data — and say so explicitly when you do it ("noting this in knowledge/X.md
   since you confirmed it applies going forward").
3. **Don't invent to fill a gap.** An empty scaffold is a signal that this hasn't been defined yet, not
   an invitation to guess plausible-sounding content. Ask, or leave it empty.
4. **One canonical source per fact.** If a value already lives elsewhere (e.g. colors in
   `ds-bundle/tokens/tokens.css`), point to it rather than duplicating it here — duplication is exactly
   what caused the Fraunces/Montserrat drift found during the Phase 0 audit.
