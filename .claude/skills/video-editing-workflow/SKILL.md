---
name: video-editing-workflow
description: Turn raw footage + an approved Reel script into an Instagram-ready edited video — inspect footage, transcribe/align, build an Edit Decision List, cut/caption/frame, render, and QA. Use when editing a video, revising an edit, adding captions, preparing a video for filming/Instagram, or rendering a final export.
metadata:
  openclaw:
    emoji: "🎞️"
---

# Video Editing Workflow

Canonical craft knowledge for editing Instagram Reels for this account. V1 priorities, in order:
**reliability, deterministic rendering, learning the real editing style, reference-driven decisions,
inspectable intermediate outputs, mandatory QA** — over maximum autonomy. This is not a generic AI video
editor; every decision should be traceable to a real input (the script, the footage, a reference video, or
a confirmed durable preference), never invented.

## Before doing anything: read the canonical sources

1. `knowledge/video-editing-style.md` — confirmed real production patterns (reference-driven building,
   the HTML/CSS+Playwright+ffmpeg pipeline, mandatory multi-timestamp QA, motion-over-text pacing). This
   already has real precedent from actual past editing sessions — read it fresh, don't work from memory.
2. `knowledge/caption-style.md` — the on-screen caption rules (word-level pill, exact script text only,
   drop uncertainty artifacts, position tracks the visual layout).
3. `knowledge/content-integrity.md` — applies to on-screen text/graphics too, not just spoken claims.
4. `knowledge/reel-style.md` — known conventions (dialect, hook length, production status pipeline).
5. `knowledge/brand.md` — visual identity (colors, fonts) for any graphic/caption styling.
6. The approved script from `reel-script-writer` (Phase 3) — beat-structured (`## HOOK`, `## BEAT N`,
   `## CTA`, `>` quote-lines for visual direction / evidence flags). This is the spoken-text source of
   truth and the beat boundaries this whole pipeline keys off of.

## What already exists — reuse, don't rebuild

| Need | Reuse | Notes |
|---|---|---|
| Media inspection | `ffprobe` | Always the first step — never assume format/resolution/duration/audio presence |
| Transcription + word timestamps | `npx hyperframes transcribe <file> --model <model> --language <code>` (media-use skill) | Whisper.cpp-backed, works standalone on any file, no project scaffolding needed. **Always pass `--model` explicitly** — see the Language rule below. Output: `[{id, text, start, end}]` |
| Silence/filler removal, transcript-driven cuts | `node <media-use-skill-dir>/scripts/transcript-cut.mjs --input <file> --transcript <json> --remove "<ranges>" --remove-fillers "<words>" --cut-silence <secs> --out <file>` | A compiler from word timestamps + cut decisions to an exact cut file. Use `--plan` first to inspect kept segments before encoding. |
| Cut/trim, reframe/crop, concat/montage, loudness | Plain `ffmpeg`/`ffprobe` recipes (below) | Deterministic, inspectable, no new dependency |
| Frame-by-frame animated overlay capture (captions, motion graphics) | Playwright (already a project dependency, already proven by `carousel-generator`) | Same technique already used in real past editing sessions per `knowledge/video-editing-style.md` |
| Reference video inspection | The `watch` skill (downloads/frames/transcript for any video URL or local path) | Use this instead of hand-rolling frame extraction for a reference clip |
| You don't need | `auto-editor`, `scenedetect`, a Python transcription stack, a new video-editor npm dependency | Not installed, not needed — `transcript-cut.mjs` already covers silence-cut off transcription timestamps alone |

**Do not adopt the full HyperFrames project/composition/render system for V1.** Its caption component
library (`caption-pill-karaoke` etc.) is well-designed and worth reading for conventions (word grouping,
positioning, exit-guarantee pattern — see `~/.claude/skills/media-use/audio/references/captions/authoring.md`),
but wiring it in means adopting an entire project/composition/render pipeline as a new dependency, which is
disproportionate for a lean V1 whose brief is "FFmpeg as the deterministic backbone." Caption *rendering*
here is bespoke HTML/CSS + Playwright + ffmpeg composite, informed by those same conventions, not built on
top of HyperFrames' render pipeline. Revisit this tradeoff explicitly if V1 proves the lean approach
insufficient — don't silently expand scope to work around it.

## Working directory convention

```
reels/<reel-slug>/
├── raw/              Original footage — NEVER modified, never overwritten
├── transcript.json   Word-level timestamps from hyperframes transcribe
├── edl.json          Machine-readable Edit Decision List
├── edl.md            Human-readable EDL
├── intermediate/     Each pipeline stage's output — cut.mp4, captioned.mp4, graded.mp4, etc.
├── qa/               QA frames/screenshots, loudness reports — never the deliverable
└── final/            Instagram-ready export only
```

Add `/reels/` to `.gitignore` — raw and intermediate video files must never enter git history (this is
exactly the mistake already found and fixed in the Phase 0 audit: 1.3GB of video once bloated this repo's
entire history).

## Input contract

Consume: raw footage, the approved script (with beats), optional reference video(s), optional
assets/B-roll/screenshots, `knowledge/video-editing-style.md`, `knowledge/caption-style.md`.

**Inspect available inputs before making any edit decision** — run `ffprobe` on every raw file, read the
full script, read any reference video via the `watch` skill, list any provided assets. Don't assume.

When something's missing, sort it into exactly one of:

- **A. Reasonably inferable** — proceed, and note the inference (e.g. no explicit crop given → infer 9:16
  vertical, the account's confirmed format).
- **B. Requires a creative decision** — ask, but ask *once*, batched, not per-field. E.g. "no reference
  video given and `knowledge/video-editing-style.md` doesn't yet cover cut pacing for straight talking-head
  footage — want me to propose a pace, or do you have a reference?"
- **C. Genuinely blocking** — say so plainly and stop that step. E.g. no raw footage at all is blocking;
  there's nothing to inspect or edit.

Don't ask unnecessary questions — most of the pipeline should run on inference + the script + the
knowledge layer without stopping to check in at every stage.

## Language rule for transcription (non-negotiable)

`.en` models silently translate non-English audio into English. This account's raw footage is Arabic/Shami
with code-switched English/Latin terms (tool names, technical terms) — **never use a `.en` model**. Start
with `--model small --language ar`. If the transcript shows garbled handling of the code-switched terms or
excessive nonsense words (same quality-check signal as media-use's transcript-handling guide: `♪`/`�`
tokens, garbled words, >20% failure rate), retry with `--model medium --language ar` before proceeding.
Always read the transcript and sanity-check it before building anything on top of it.

## V1 Pipeline

**Stage grouping** (Salim's required explicit stages — Clean Cut always completes, and ideally gets
reviewed, before Creative Edit begins; don't blend them into one pass):

`RAW (1-2) → Clean Cut (3-5) → Creative Edit (6, 9-10) → Captions/Motion (7) → Audio (11) → QA (12-15) → Final (16)`

1. **Inspect raw footage.** `ffprobe` every file — duration, resolution, fps, codec, audio
   presence/channels. This is what step 12 of the QA section verifies against, so record it.
2. **Transcribe/align.** `hyperframes transcribe` on the raw audio/video per the language rule above.
   Quality-check the transcript before proceeding (see media-use's transcript-handling guide) — **whisper
   can genuinely hallucinate a repetition loop on raw footage with long silences/multiple takes**,
   confirmed for real during Salim's training-pair analysis (2026-08-16): both `small` and `medium`
   models got stuck repeating the same phrase in an unnaturally exact, mechanical cycle for 100+ seconds.
   A basic quality check (looking for `♪`/garbled tokens) misses this — also check for an n-gram that
   repeats far more than a real retake pattern would (e.g. the same 4-word phrase appearing more than
   ~3-5 times) and cross-verify against `ffmpeg silencedetect` (objective, ASR-independent) and real
   frames before trusting a raw transcript's word-level detail.
3. **CLEAN CUT — map footage to script beats and select takes.** This is judgment, not a formula: for
   each beat's spoken line, locate where it was actually said in the raw footage (there may be multiple
   takes — pick the best one). Read `knowledge/clean-cut-playbook.md` before doing this — it has
   real, measured thresholds from Salim's own past edits, not defaults. Known limitation as of V1: take
   *selection* criteria (why one take beats another) isn't confirmed yet — when genuinely unsure, prefer
   the least risky choice and flag the uncertainty rather than guessing a reason.
4. **Create the Edit Decision List** (`edl.json` + `edl.md`) — see format below. Do this *before* cutting
   anything; the EDL is the plan, not a byproduct of already having edited. This closes out Clean Cut —
   the EDL's cut/silence-removal decisions should be reviewable/approvable before Creative Edit begins.
5. **Identify silence/dead-air/mistakes.** Per `knowledge/clean-cut-playbook.md`: **preserve pauses of
   ~0.15-0.46s** (measured from real edits — this is natural speech rhythm, not a miss), **remove gaps of
   ~0.6s or longer entirely**. The ~0.46-0.6s zone has no supporting evidence yet — treat it as a judgment
   call, not a hard rule. Also flag filler/false-start patterns the agent reads directly (take-selection
   confidence is still low here, per the playbook — don't invent a selection reason). Feeds the EDL's
   silence-removal field and becomes `transcript-cut.mjs`'s `--remove`/`--remove-fillers`/`--cut-silence`
   arguments.
6. **CREATIVE EDIT — propose visual treatment per beat.** Per the motion-over-text philosophy below,
   informed by the script's own `> Visual:` hints (Phase 3) and any reference video's real, inspected
   characteristics.
7. **CAPTIONS/MOTION.** Build the word-level pill overlay from the APPROVED SCRIPT TEXT, timed via
   alignment to the real ASR timestamps from step 2 — see the Captions section below. This is
   non-negotiable.
8. **Cuts/pacing.** Execute via `transcript-cut.mjs` (silence/filler removal) plus explicit `ffmpeg -ss/-to`
   trims + concat for creative cuts beyond silence removal. **`-c copy` trims snap to the nearest keyframe,
   not the requested timestamp** — confirmed by a real Phase 4 QA failure: a `-c copy` trim requested at
   2s–9s actually started at ~6.3s because the source's only keyframes were at 0s and 8.3s. For any cut
   whose timing matters (i.e. anything driven by the EDL's beat/word timestamps), re-encode
   (`-c:v libx264 -pix_fmt yuv420p -c:a aac`) instead of `-c copy`. Stream-copy is fine only for a rough,
   non-timing-critical trim where speed matters more than frame accuracy.
9. **Punch-ins/zooms/reframes.** `ffmpeg` `zoompan` for punch-ins, `crop`+`scale` for reframing — every
   application needs a reason recorded in the EDL, not applied by default.
10. **B-roll/screenshots/graphics.** `ffmpeg overlay` (composite over base footage) or a cutaway (concat)
    depending on the EDL's treatment — only when it improves comprehension/retention, per the visual
    philosophy below.
11. **Audio cleanup/levels.** Two-pass `loudnorm`, -14 LUFS (social target):
    ```bash
    ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -
    ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=<i>:measured_TP=<tp>:measured_LRA=<lra>:measured_thresh=<thresh>:offset=<offset>:linear=true:print_format=summary out.wav
    ```
12. **Render.** Assemble into `final/<reel-slug>.mp4` — 1080x1920, H.264/yuv420p, AAC audio, Instagram-ready
    bitrate. A successful ffmpeg exit code is not completion — QA is mandatory next.
13. **Multi-timestamp visual QA** (mandatory, see below).
14. **Audio QA** (mandatory, see below).
15. **Revise if QA fails.** Fix the specific issue, rerun only the affected stage(s), rerender, re-QA —
    don't restart the whole pipeline for a local problem.
16. **Final Instagram-ready export**, confirmed via QA, placed in `final/`.

## Edit Decision List format

Both files, always — machine-readable for tooling, human-readable for Salim's review.

`edl.json`:
```json
{
  "reelId": "slug-or-calendar-item-id",
  "sourceScript": "path/reference to the Phase-3 script used",
  "rawFootage": ["reels/<slug>/raw/take1.mp4"],
  "targetSpec": { "width": 1080, "height": 1920, "fps": 30, "codec": "h264/aac" },
  "beats": [
    {
      "beatId": "HOOK",
      "spokenLine": "exact script text for this beat",
      "sourceRange": { "file": "raw/take1.mp4", "start": 12.3, "end": 15.8, "notes": "best take — take 2 had a stumble on 'GTM'" },
      "outputRange": { "start": 0.0, "end": 3.4 },
      "cutDecisions": ["trimmed 0.4s leading silence"],
      "silenceRemoval": [{ "start": 13.1, "end": 13.6, "reason": "0.5s dead air mid-sentence" }],
      "captionTreatment": { "style": "word-level pill", "position": "lower-middle", "words": [{ "text": "...", "start": 0.0, "end": 0.3 }] },
      "framing": { "crop": "9:16 centered", "notes": "no reframe needed, subject already centered" },
      "punchIn": { "applied": false, "notes": "not needed on the hook — full energy already in delivery" },
      "broll": { "asset": null, "range": null, "reason": "n/a for this beat" },
      "motionGraphic": { "applied": false, "notes": "" },
      "audioTreatment": { "loudnorm": true, "notes": "" },
      "reasoning": "why these decisions were made for this beat specifically"
    }
  ],
  "qa": { "status": "pending", "timestampsChecked": [], "issues": [] },
  "status": "draft"
}
```

`edl.md` — the same content as a readable per-beat breakdown, for Salim to review/approve before
execution when the workflow calls for approval (see Learning loop below).

Every field is "as appropriate" — don't force `broll`/`motionGraphic`/`punchIn` to be populated when a
beat is plain talking-head with nothing added. An empty/false field with a one-line reason is correct, not
incomplete.

**The EDL is the bridge between `reel-script-writer` and this skill — decisions live here, not buried only
inside generated shell commands.** A shell command executes a decision; it doesn't replace recording one.

## Captions — critical rule

**On-screen captions use the APPROVED SCRIPT TEXT. ASR/transcription is for timing/alignment only.**

Never replace approved wording with an ASR guess or paraphrase — this is the same rule already proven in
real past sessions (`knowledge/caption-style.md`): align script words to the real spoken timestamps from
the transcript, but the *displayed* text is always the script's words, not whatever the ASR happened to
transcribe (which may contain mishearings, filler, or differ from a cleaned-up script).

Style: word-level "pill" captions, karaoke-timed. Position tracks the visual layout — lower-middle for
portrait full-frame, or the seam between split layouts if the beat has one (per `knowledge/caption-style.md`).
Word grouping: 2-3 words for high-energy delivery, 3-5 for conversational, per the beat's actual pacing —
not a fixed count throughout.

## Visual philosophy — motion over text

Per the confirmed preference in `knowledge/video-editing-style.md`: **animate or visualize the idea, don't
restate every spoken sentence as more on-screen text.** Use movement, framing changes, screen recordings,
relevant screenshots, diagrams, UI demos, B-roll, or graphical motion when they improve comprehension or
retention — every visual addition needs a reason recorded in the EDL, not a default "add something here."
A beat with nothing but clean talking-head delivery is a legitimate, complete beat.

## Reference-driven editing

When a reference Reel/video is provided, inspect it directly (the `watch` skill) — don't infer from a
description. Extract, from what's actually observed: cut frequency, pacing, caption placement/animation,
framing, zoom behavior, B-roll frequency, transition behavior, graphic language, sound design, rhythm.

Use it as evidence for THIS edit's decisions, cite what was actually observed ("the reference cuts every
1.5-2s during the fast section, cuts every 4-5s during the explanation section — matching that pacing
here"), and never claim a characteristic that wasn't actually inspected.

## QA — mandatory, every time

A successful ffmpeg exit code is not completion. Before declaring an edit finished:

1. Extract frames at multiple timestamps spread across the full duration (not just first/last) —
   `ffmpeg -ss <t> -i final.mp4 -frames:v 1 qa/frame_<t>.png` — and actually look at them (Read tool).
2. Verify captions visually: present, correctly timed, correctly positioned, matching the approved script
   text (not ASR garble).
3. Verify crop/framing — no unintended cropping of the subject, correct aspect ratio.
4. Verify overlays/assets/graphics rendered correctly, no missing/broken elements.
5. Verify no broken/corrupted frames.
6. Verify timing feels right relative to the EDL's planned output ranges.
7. Verify audio: present, correct levels (loudness check, not silent, not clipping).
8. Verify final output spec: resolution, aspect ratio, duration, codec — `ffprobe` against `targetSpec`.
9. Verify the final file actually opens/decodes cleanly (`ffprobe` succeeding end-to-end is the practical
   proxy here).

If QA reveals an issue, fix it and rerender before reporting completion — don't report a finished edit with
a known, unresolved issue. Keep `qa/` artifacts separate from `final/` — QA frames are not deliverables.

## Learning loop — approval-oriented for V1

When Salim corrects an edit, distinguish:

- **One-off**: specific to this Reel only (e.g. "cut faster right here because this line has a joke in
  it"). Apply it, don't generalize it.
- **Durable preference**: a reusable editing preference (e.g. "always cut on the beat of my speech, never
  mid-word" or "I never want more than 2 punch-ins per Reel"). Only *this* category updates
  `knowledge/video-editing-style.md` — and say so explicitly when it happens, per the knowledge-layer rule
  in `CLAUDE.md`.

Don't turn every correction into a permanent rule — that's how the system stops actually learning Salim's
style and starts overfitting to one Reel's quirks. When genuinely unsure which category a correction is,
ask which it is rather than guessing.

V1 defaults to producing an edit plan/EDL and a preview for approval before committing to a final render —
full-auto mode is a later graduation once enough confirmed preferences exist in
`knowledge/video-editing-style.md` for a given edit type, not a V1 default.

## Never

- Render a "finished" edit without running the full QA pass.
- Replace approved script text with ASR output in captions.
- Overwrite or modify files in `raw/`.
- Fabricate a reference video's characteristics without actually inspecting it.
- Add a visual/B-roll/graphic without a reason.
- Generalize a one-off correction into `knowledge/video-editing-style.md` without confirming it's durable.
- Commit video files to git — `reels/` is gitignored for exactly the reason the Phase 0 audit found.
