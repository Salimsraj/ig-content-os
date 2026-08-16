---
name: hook-craft
description: Generate and analyze Instagram Reel hooks using the 5-lever framework (contrast, context, specificity, proof, register). Use when generating new hook angles for an idea, scoring/analyzing an existing hook, ranking multiple hook candidates, or rewriting a weak hook.
metadata:
  openclaw:
    emoji: "🪝"
---

# Hook Craft

Canonical craft knowledge for Instagram Reel hooks — both **generation** (new angles for an idea) and
**analysis** (scoring, ranking, rewriting existing hooks). This is the same framework that already
grounds the live web dashboard's hook tooling (`lib/hook-evaluator.ts`, `lib/hook-rewriter.ts`), applied
natively here rather than through a separate API call.

## Before doing anything: read the canonical sources

1. `knowledge/hook-framework.md` — the actual 5-lever framework, scoring calibration, dialect handling,
   length constraint, and grounding rule. Read this every time; don't rely on memory of it from earlier
   in the conversation, since it can change.
2. `knowledge/brand.md` — dialect/register (Arabic, Shami, natural code-switching).
3. `knowledge/audience.md`, `knowledge/positioning.md`, `knowledge/content-pillars.md` — who this is for
   and what the account is about. Use these to judge fit and register, not just the 5 levers in
   isolation.
4. `knowledge/performance-learnings.md` — real, confirmed performance learnings, if any exist yet. As of
   Phase 2 this file is seeded empty (Phase 7 populates it) — if it's empty, say so plainly rather than
   inventing what "has worked."

## Grounding data (read directly, don't invent)

- `data/viral-hook-analysis.json` — ~75 real scored Arabic hooks, each with an actual 5-lever score.
  Shows correct register/proof style for this audience.
- `data/hook-templates.json` — ~999 fill-in-the-blank structural templates (English), tagged by category
  (EDUCATIONAL, COMPARISON, MYTH BUSTING, STORYTELLING, AUTHORITY, DAY IN THE LIFE). These are shapes for
  a hook's underlying logic, never sentences to translate literally.

Sample a handful fresh each time you use this skill (don't reuse the same subset repeatedly) — pick
whichever real examples/templates actually fit the new idea or script, and be explicit about which one(s)
inspired each hook you produce. Never cite a source you didn't actually read from these files, and never
invent a plausible-sounding "real example" — if you didn't read it from the file, don't present it as
grounded.

## Mode: GENERATE (idea → hook options)

Goal: genuinely different **strategic angles**, not superficial wording variations of the same idea.

1. Understand the core idea/topic being asked about.
2. Sample real reference material from `data/viral-hook-analysis.json` and `data/hook-templates.json`.
3. Produce as many hooks as requested, each taking a **different structural approach** — vary which
   lever leads (a contrast-led hook, a specific-number-led hook, a myth-bust, a personal-result/proof
   lead, a direct audience-callout, a question, etc.). For a request like "10 hooks," that should read as
   several genuinely distinct angle families, not 10 near-identical rewordings.
4. Write in the account's dialect (Arabic/Shami, per `brand.md`) unless the request is explicitly for
   different-language content — one short sentence, ~8–15 words, matching the length constraint in
   `hook-framework.md`.
5. For each hook, state: the hook text, the strategic angle/lever it leans on, and (when it meaningfully
   applies) which reference example/template inspired it. Explain the angle only when it adds real
   value — don't pad every hook with boilerplate reasoning.
6. Never state a predicted skip rate as if it were a fact. If you estimate one, label it clearly as a
   framework-based prediction, not measured performance.

## Mode: ANALYZE (hook → score / rank / rewrite)

1. Score the hook on the 5 levers (0–10 each) per `hook-framework.md`'s calibration.
2. Identify the weakest lever and concrete issues (specific to this hook, not generic advice).
3. Identify real strengths too — analysis isn't just fault-finding.
4. If multiple hooks are given, rank them and explain the ranking against the levers — don't just assign
   scores and let the reader infer the order.
5. Propose stronger rewrite(s), grounded the same way as GENERATE mode (real reference material, not
   invented).
6. **Distinguish framework-based judgment from actual performance evidence, explicitly, every time.**
   A score/prediction from this framework is an informed estimate, not a measurement. If the request
   involves "what's worked" or real performance, check `knowledge/performance-learnings.md` — if it has
   a relevant, real entry, cite it as evidence; if it's empty or irrelevant, say plainly that no real
   performance data exists for this yet, rather than presenting a framework prediction as if it were
   proven.

## Never

- Fabricate a "real example" or citation you didn't actually read from the data files.
- Present a skip-rate prediction or lever score as measured fact.
- Claim something "worked on the account" without a real, sourced entry in `knowledge/performance-learnings.md`.
- Attribute a quote/endorsement to a real named person without verification — see
  `knowledge/content-integrity.md`, which applies here directly.
