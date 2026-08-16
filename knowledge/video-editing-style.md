# Video editing style

No `video-editor` agent exists in this repo yet (Phase 4) — but Salim has shared real editing sessions
from other tools showing his actual working style and preferences. Sourced 2026-08-16, not invented.
Note: some of these examples (the "Record a Skill" / hand-drawn AI-takeover pieces) are Claude/Anthropic
product marketing content, not confirmed to be for this Instagram account — the *craft/process*
preferences below are cross-applicable regardless; ask before assuming the *specific subject matter*
(GTM-engineering topics vs. product-marketing topics) applies here too.

## Reference-driven building (confirmed, repeated pattern)

- When given a reference clip, screenshot, image, or a live UI (e.g. a GitHub page, a website, an app):
  **actually inspect it directly** — extract real frames, take real screenshots, zoom in/out — rather
  than inferring style from a description or filename. This was stated as an explicit operating
  instruction, not just something observed in past sessions.
- When a reference has a real asset available (a real photo from footage, a real screen-recording, a real
  logo, a real UI capture), **reuse the real asset** rather than generating a placeholder/mockup
  stand-in. Placeholder art gets swapped for the real thing as soon as it's available.
- Break a reference down into its actual pieces (e.g. extracting a hand-drawn illustration's individual
  shapes to animate them separately) rather than recreating it freehand from a general impression.

## Production pipeline (confirmed, repeated pattern)

- Animated scenes are built as HTML/CSS, captured deterministically frame-by-frame (Playwright), then
  composited/encoded with ffmpeg — matches the FFmpeg-first, deterministic-tooling decision (D.3).
- Mandatory spot-check QA at multiple timestamps across the *full* timeline before delivering anything —
  not just checking the first/last frame. This matches D.4's "always perform final visual/audio QA"
  decision directly; there's a real precedent for it already.
- Formats seen in real use: horizontal (960×540) for short hook/preview clips, vertical (1080×1920 or
  608×1080) for full Reels — both are legitimate depending on the deliverable, not a single fixed
  aspect ratio.

## Motion and pacing preference (confirmed correction from real feedback)

- Default to **motion carrying the idea, not on-screen text restating the voiceover.** When a cut leaned
  on sentences/words to explain what was happening, the explicit correction was: strip the sentences,
  let animation do the work (an actual cursor clicking a real UI element, a counter/timer running, steps
  checking off, a replay loop) — at most 1–2 punchy words per beat, not paragraphs.
- When told to "make it longer," the fix was **more room for motion to breathe** (a slower, more
  legible animation), not more content crammed in.
- Iterate on precise, literal creative briefs when given one — a detailed shot-by-shot brief (exact
  timing, explicit exclusions like "no text, no particles, no glowing effects") should be followed
  exactly, not loosely interpreted.

## Still open

Cut pacing / dead-air tolerance for straight talking-head footage (as opposed to the motion-graphics
examples above), punch-in/zoom conventions, B-roll usage patterns, music/audio treatment. To be captured
as `video-editor` (Phase 4) runs in the hybrid edit-plan-for-approval mode (D.4) and real preferences get
confirmed repeatedly.
