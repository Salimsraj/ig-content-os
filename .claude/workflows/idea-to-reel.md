# Playbook: "Turn this idea into a Reel"

Status: **target design, not yet fully implemented.** This documents the intended end-to-end flow so the
Chief of Staff (and future implementation work) has a concrete target. Each step below notes which phase
delivers it. Until all phases land, the Chief of Staff should do as much of this as current tooling
allows and be explicit about what it can't do yet.

This is the first major end-to-end milestone for the whole system.

## Trigger

Natural language, not a specific command — e.g. "turn this idea into a Reel", "I have an idea about X,
help me make it", or an idea already sitting in the calendar with status "Idea".

## Steps

1. **Understand the idea.** Chief of Staff (native capability, works today) — clarify the core idea
   through conversation if it's vague; read `knowledge/content-pillars.md` and `knowledge/positioning.md`
   for fit once those are populated.
2. **Generate hook options.** `hook-generator` agent (Phase 2) — produces multiple grounded hook options
   per `knowledge/hook-framework.md`, sourced from `data/viral-hook-analysis.json` /
   `data/hook-templates.json`.
3. **Score and select a hook.** `hook-analyzer` agent (Phase 2) — scores each option on the 5 levers,
   surfaces the weakest lever and predicted skip rate; Salim picks (or asks Chief of Staff to pick the
   strongest).
4. **Write the Reel script.** `reel-script-writer` agent (Phase 3) — full script (hook → body → CTA),
   written into the canonical content item (see D.1 content model, formalized in Phase 3).
5. **Create the editing plan.** `video-editor` agent (Phase 4) — once raw footage exists, produces an
   edit plan/EDL (transcription via the existing `media-use` skill, silence/dead-air removal, cuts,
   captions, punch-ins/zooms, B-roll placement, audio/music treatment) and a preview, for approval —
   hybrid mode per D.4 until enough style preferences are captured in `knowledge/video-editing-style.md`
   to support full-auto for a given edit type.
6. **Render and QA.** `video-editor` agent (Phase 4) — FFmpeg renders the approved plan; a visual/audio
   QA pass always runs before declaring the export finished (D.4 — non-negotiable, even in full-auto
   mode).
7. **Generate captions.** `caption-writer` agent (Phase 5) — IG caption + CTA per `knowledge/caption-style.md`
   and `knowledge/cta-rules.md`.
8. **Update status.** `calendar-ops` agent (Phase 6) — moves the content item through its status pipeline
   (Idea → Scripting → To Film → To Edit → Scheduled), writing back to the canonical content model.
9. **Final package.** Chief of Staff assembles the Instagram-ready output: final video export, caption
   text, and confirmation of scheduled date/status — ready to post.

## After posting (separate, later trigger — "analyze what worked this month")

`performance-analyst` agent (Phase 7) diagnoses real performance once posted and appends confirmed,
falsifiable learnings to `knowledge/performance-learnings.md` — closing the loop back into steps 2–4 for
future ideas.
