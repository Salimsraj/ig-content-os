# Knowledge Layer

Canonical, AI-readable source of truth for brand, voice, audience, craft standards, and accumulated
performance learnings across the Instagram Content OS. Every skill and agent reads from here before
producing content. This is the single place that should change when a durable preference or learning
is confirmed — not scattered across individual skill files or code comments.

## Files

| File | Purpose | Status as of 2026-08-16 |
|---|---|---|
| `brand.md` | Visual identity, tone, dialect | Migrated from existing `BRAND.md` / `ds-bundle` |
| `audience.md` | Who the content is for | Populated — GTM Engineering audience confirmed from a real reel script |
| `positioning.md` | What this account stands for vs. alternatives | Partially populated; differentiation still open |
| `content-pillars.md` | Recurring content themes/categories | GTM Engineering education pillar confirmed; others still open |
| `offers.md` | What (if anything) this account sells/promotes | Empty scaffold |
| `hook-framework.md` | The 5-lever hook-scoring/writing framework | Migrated verbatim from `lib/hook-evaluator.ts` |
| `reel-style.md` | Reel structure, pacing, dialect conventions | Partially populated from known facts; rest is scaffold |
| `video-editing-style.md` | Reference-driven building, production pipeline, motion-over-text pacing | Populated from real editing sessions; cut pacing/B-roll/music still open |
| `caption-style.md` | On-screen caption rules (confirmed); IG post caption style (open) | On-screen captions populated with real, repeated rules; post captions still open |
| `cta-rules.md` | When/how to ask for follows, comments, saves, etc. | Empty scaffold (one real CTA pattern noted in `content-pillars.md` — a "comment a keyword for resources" lead magnet) |
| `content-integrity.md` | Cross-cutting guardrail: never fabricate quotes/endorsements tied to real named people | Populated — real precedent |
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
