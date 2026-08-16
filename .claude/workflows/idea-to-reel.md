# Playbook: "Turn this idea into a Reel"

Status: **steps 1–6 implemented (Phases 0–4); steps 7+ still target design.** Each step below notes which
phase delivers it. Until all phases land, the Chief of Staff should do as much of this as current tooling
allows and be explicit about what it can't do yet. As of Phase 4, step 6 is architecture/tooling-validated
but not yet proven on a real edit — no raw footage exists in the repo yet (see Phase 4 completion report).

This is the first major end-to-end milestone for the whole system.

## Trigger

Natural language, not a specific command — e.g. "turn this idea into a Reel", "I have an idea about X,
help me make it", or an idea already sitting in the calendar with status "Idea".

## Steps

1. **Understand the idea.** Chief of Staff (native capability, works today) — clarify the core idea
   through conversation if it's vague; read `knowledge/content-pillars.md` and `knowledge/positioning.md`
   for fit once those are populated.
2. **Generate hook options. Done (Phase 2).** `hook-generator` agent — produces multiple grounded hook
   options per `knowledge/hook-framework.md`, sourced from `data/viral-hook-analysis.json` /
   `data/hook-templates.json`.
3. **Score and select a hook. Done (Phase 2).** `hook-analyzer` agent — scores each option on the 5
   levers, surfaces the weakest lever and predicted skip rate; Salim picks (or asks Chief of Staff to pick
   the strongest).
4. **Write the Reel script. Done (Phase 3).** `reel-script-writer` agent — full script in the confirmed
   beat format (`## HOOK`, `## BEAT N`, `## CTA`), grounded in `data/own-reel-transcripts.json` and the
   knowledge layer, with `NEEDS VERIFICATION` tags on any unconfirmed claims. Storable directly in the
   canonical content item (the Calendar/Ideas Notion DB) with no schema change.
5. **Create the editing plan. Done (Phase 4).** `video-editor` agent — once raw footage exists, produces
   an Edit Decision List (`edl.json`/`edl.md`) from footage inspection + transcription (via the
   `media-use` skill's `hyperframes transcribe`) + the approved script's beats — silence/dead-air removal,
   captions (from approved script text, ASR for timing only), punch-ins/zooms, B-roll placement, audio
   treatment — for approval before rendering, per the hybrid mode in D.4, until enough style preferences
   are captured in `knowledge/video-editing-style.md` to support full-auto for a given edit type.
6. **Render and QA. Done (Phase 4).** `video-editor` agent — FFmpeg renders the approved EDL; a
   multi-timestamp visual + audio QA pass always runs before declaring the export finished (D.4 —
   non-negotiable, even in future full-auto mode). Not yet proven end-to-end on real footage — see the
   Phase 4 completion report for what's needed for the first real test.
7. **Generate captions.** `caption-writer` agent (Phase 5) — the IG **post caption** (text under the
   post) + CTA per `knowledge/caption-style.md` and `knowledge/cta-rules.md`. Distinct from Phase 4's
   on-screen video captions, which are already handled inside step 5/6.
8. **Update status.** `calendar-ops` agent (Phase 6) — moves the content item through its status pipeline
   (Idea → Scripting → To Film → To Edit → Scheduled), writing back to the canonical content model.
9. **Final package.** Chief of Staff assembles the Instagram-ready output: final video export, caption
   text, and confirmation of scheduled date/status — ready to post.

## After posting (separate, later trigger — "analyze what worked this month")

`performance-analyst` agent (Phase 7) diagnoses real performance once posted and appends confirmed,
falsifiable learnings to `knowledge/performance-learnings.md` — closing the loop back into steps 2–4 for
future ideas.
