---
name: reel-script-writing
description: Turn an idea + selected hook into a complete Instagram Reel script in the account's real Arabic/Shami GTM Engineering voice, or rewrite/condense/prepare an existing script. Use when writing a new script, shortening a script, rewriting part of a script while preserving the hook, or preparing a script for filming.
metadata:
  openclaw:
    emoji: "🎬"
---

# Reel Script Writing

Canonical craft knowledge for writing Instagram Reel scripts for this account. This is **not** a
generic AI script writer — it writes in this specific account's real, sourced voice, using its real
confirmed structure, and never invents evidence.

## Before doing anything: read the canonical sources

1. `knowledge/audience.md`, `knowledge/positioning.md`, `knowledge/content-pillars.md` — who this is for,
   what the account stands for, and the confirmed content pillar (GTM Engineering education).
2. `knowledge/content-integrity.md` — the non-negotiable guardrail on fabricated quotes/endorsements/
   statistics/citations. Applies to every script.
3. `knowledge/hook-framework.md` — if the hook needs any adjustment for fit with the script body, it
   still has to hold up under the 5-lever framework.
4. `knowledge/brand.md` — dialect and register (Arabic, Shami, natural code-switching).
5. `data/own-reel-transcripts.json` — real historical spoken transcripts from this account. This is the
   actual voice reference: how Salim really talks on camera (tool names in Latin script, practical
   step-by-step GTM tutorials, casual Shami register, ending on a "comment X and I'll send it" CTA
   pattern). Read this before writing — don't write from a generic idea of "Arabic startup content."

## The confirmed structure (apply flexibly, not mechanically)

From `knowledge/content-pillars.md`'s real, sourced pattern:

1. Audience call-out / hook
2. Clear definition or framing
3. Concrete example
4. Real citation/evidence, when a named external fact/person/company is used
5. Market-gap / why-this-matters framing
6. Lead-magnet or appropriate CTA

Use what the content actually needs. A short tactical tip doesn't need a market-gap section. A
myth-busting piece might not need a concrete example beyond the myth itself. Don't force all six every
time — that produces stiff, formulaic scripts, which defeats the point of having a real voice reference.

## Content integrity — non-negotiable, checked on every script

Never fabricate: quotes, endorsements, statistics, company claims, citations, named-person opinions. If
the script calls for evidence you don't actually have (a stat, a named person's opinion, a specific
company claim), do not invent a plausible one. Instead, write the line as **`[NEEDS VERIFICATION: <what
needs to be confirmed and why>]`** inline, exactly that tag, so it's easy to find and impossible to
mistake for finished copy. Never fill that gap with something that "sounds about right."

This is the same rule as `knowledge/content-integrity.md`, applied at script-writing time instead of
caption/hook time.

## Output format — beat-structured, built on Notion's existing block types

The canonical script uses this structure so it stores cleanly in the *existing* Calendar item's Notion
page body (`lib/notion.ts`'s `blockToText`/`lineToBlock` already round-trip `##` headings and `>` quotes
— no new storage, no schema change):

```
## HOOK
<spoken line — the selected hook, verbatim or lightly adjusted for flow into the script>
> Visual: <on-screen treatment, if it matters for this beat>

## BEAT 1 — <short label>
<spoken line(s) for this beat>
> Visual: <on-screen treatment, B-roll/screen-recording/graphic note — omit if nothing beyond talking head>
> Evidence needed: <only if this beat makes a claim requiring a source — use the NEEDS VERIFICATION tag here>

## BEAT 2 — <short label>
...

## CTA
<spoken line — the closing ask, per the account's confirmed CTA pattern>
```

Each `## ` heading is one beat — this is what Phase 4's video editor will key off of to map spoken line →
timing → visual treatment → captions → B-roll/graphic → edit decision, so keep beats meaningfully
separated (a new beat when the idea/visual genuinely changes, not one beat per sentence).

`> Visual:` is optional per beat — only include it when there's a real visual direction worth specifying
(a screen recording, a graphic, a specific framing). Don't pad every beat with a generic "talking head"
note.

## Duration estimates

When asked for a target length (e.g. "give me a 30-second version"), estimate using a standard spoken
pace of roughly **2.5–3 words per second** for natural Shami delivery — label it clearly as an estimate
("~30s at a natural pace, based on word count — actual timing depends on how it's delivered"), never as
measured timing. Real timing only exists once there's real recorded audio (Phase 4's job).

## Modes

**FULL SCRIPT** (idea + selected hook → complete script): write the whole thing in the beat format above,
grounded in the real voice reference and the confirmed structure, applied flexibly.

**REWRITE** (existing script → modify per instruction): preserve whatever the instruction says to
preserve (commonly the hook beat) exactly; change only what's asked. "Make this sound more like me" means
re-check against `data/own-reel-transcripts.json` and tighten register/phrasing to match it more closely
— point out specifically what changed and why it's closer to the real voice reference.

**CONDENSE** (long script → shorter target): cut for length while preserving the hook and the core
claim/payoff — cut supporting beats or trim within beats first, don't just truncate the end.

**FILMING-READY** (script → confirm/complete beat structure for production): check every beat has a clear
spoken line, flag any beat whose visual direction is genuinely ambiguous, and confirm no
`NEEDS VERIFICATION` tags remain unresolved — if any do, surface them clearly rather than quietly
shipping a script with unverified claims.

## Never

- Invent a statistic, quote, endorsement, or named-person claim — use `NEEDS VERIFICATION` instead.
- Force all six structural sections when the content doesn't call for them.
- Write in a generic "AI startup content" voice — ground every script in the real transcripts and
  knowledge layer, every time, not from memory of earlier in the conversation.
- Silently drop or resolve a `NEEDS VERIFICATION` tag without being told the evidence is now confirmed.
