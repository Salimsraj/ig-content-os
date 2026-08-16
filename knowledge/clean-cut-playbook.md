# Clean Cut Playbook V1

Learned from 2 real raw→edited training pairs Salim provided (2026-08-16), analyzed via video frames,
`ffmpeg silencedetect` (objective, ASR-independent), and transcripts where reliable. This file is scoped
to **raw → clean cut decisions only** — take selection, silence/dead-air removal, pause preservation. It
does not cover motion graphics, B-roll, captions, or music (the training edits already had those
composited in, but this playbook deliberately doesn't try to reverse-engineer that layer yet — see the
scope note below).

## Source material

| | Pair 1 | Pair 2 |
|---|---|---|
| Raw duration | 104.9s | 125.9s |
| Edited duration | 33.5s | 32.2s |
| Kept ratio | 31.9% | 25.6% |
| Raw format | 832×400 landscape | 832×464 landscape |
| Edited format | 464×832 portrait | 464×832 portrait |

**Scope note:** both `edited.mp4` files turned out to be fully finished, published-style Reels — split-screen
layout (screen-recording/UI-demo on top, talking-head on bottom) with burned-in word-level captions
already composited, not a bare "clean cut" intermediate. This playbook's findings are about the
underlying spoken/audio track and its timing, which the visual overlay doesn't affect — but it means
these two examples don't isolate a "clean cut only" output to study directly. Treat this playbook as
inferred from finished pieces, not from an intermediate clean-cut stage Salim actually produces
separately.

**ASR reliability note (important, affects confidence throughout):** whisper.cpp — both `small` and
`medium` models — genuinely hallucinated (got stuck in a mechanical, unnaturally exact repetition loop)
on both raw files' opening sections. This was verified as a real ASR bug, not real repeated speech, by
checking cycle timing (an impossible, metronomic ~3.0s-exactly cycle sustained for 100+ seconds in pair
1) against real video frames and objective `silencedetect` output. Where this matters, findings below are
based on `silencedetect` + direct frame inspection rather than word-level transcript alignment, and
confidence is marked accordingly. The **edited** files' transcripts were clean and reliable throughout.

## 1. How to identify unusable takes

**Confidence: low.** Both raw files had ASR quality issues that prevented precise word-level comparison
of rejected vs. selected takes. Visual inspection (pair 2) confirmed multiple takes existed at the same
seated position/gesture with near-identical content, but couldn't establish *why* a specific one was
rejected (stumble, weak delivery, etc. — no clearly visible stumble was caught in the sampled frames, but
frames were sparse, not continuous). **Do not assume a specific rejection criterion** — this needs more
examples, ideally with cleaner audio, before a rule can be stated.

## 2. How to choose between repeated takes

**Confidence: low/ambiguous.** Pair 2 showed 5+ attempts at the same opening line; the edited version's
actual wording didn't cleanly match any single sparsely-ASR-captured attempt, so which exact take (or
whether multiple takes were spliced together) could not be confirmed. **Do not assume "last take wins"
or "cleanest take wins"** — neither was confirmed nor ruled out. This is exactly the kind of question
Step 3 was supposed to answer and the evidence wasn't strong enough — flagging honestly rather than
guessing.

## 3. How aggressively to remove silence — the one strongly-confirmed measurement

**Confidence: high.** This is the best-supported finding in this playbook, consistent across both pairs:

- **Pauses actually kept in the final edit: 0.15s–0.46s** (measured directly via `silencedetect` on both
  `edited.mp4` files — every remaining internal silence fell in this range, no exceptions).
- **Gaps confirmed removed from raw footage: ≥0.6s** (both raw files had multiple silence stretches from
  0.6s up to 9.8s that don't appear in the edited output at all).
- **Judgment zone: ~0.46s–0.6s** — no example fell in this exact range, so there isn't evidence for
  where the line actually is within it. Treat this as ambiguous, not a confirmed threshold.

Practical rule: **preserve pauses under ~0.45s** (natural breathing/phrase rhythm), **remove gaps over
~0.6s** entirely, and treat anything in between as a judgment call pending more data.

## 4. How to handle hesitation/filler

**Confidence: none yet.** Neither pair's evidence isolated a clear filler-word removal instance
distinctly from a take-restart. No rule stated — needs cleaner examples.

## 5. How to handle breaths

**Confidence: none yet.** Not distinguishable from natural pauses in this data (same 0.15-0.46s range
covers both plausibly). No separate rule.

## 6. How to handle false starts

**Confidence: medium.** Both pairs show the *pattern* of restarting the opening line multiple times
before the kept version — this is well-confirmed as something that happens. What's not confirmed is the
selection logic (see #2). So: expect false starts on hook/opening lines specifically (see #9), and expect
them to be removed entirely (not trimmed-and-kept) — but not which one gets kept.

## 7. How to handle sentence restarts

Same as #6 — restarts happen and get removed wholesale (not partially kept), but selection criteria
unconfirmed.

## 8. How tightly to cut around speech

**Confidence: high** for the pause-boundary numbers in #3 — cuts land close to speech, not with generous
padding (0.46s is already a fairly tight preserved-pause ceiling).

## 9. When to preserve a natural pause

Pauses under ~0.45s between phrases/sentences are preserved (see #3) — this reads as natural speech
rhythm, not something to compress further.

## 10. How to maintain conversational rhythm

**Confidence: medium.** Both edits kept a noticeably tighter, faster rhythm than the raw (kept ratios of
25.6% and 31.9% — roughly a quarter to a third of raw duration survives). This is a real, consistent
signal that the target rhythm is fast/compressed, even though the exact take-selection logic behind it
isn't confirmed.

## 11. How to avoid robotic over-cutting

The 0.15-0.46s preserved-pause range (not 0s) is itself evidence against zero-tolerance silence removal —
some breathing room between phrases is intentional, not a miss.

## 12. How to resolve uncertainty

Per Salim's own instruction: when evidence is ambiguous (take-selection criteria, filler/breath handling,
the exact 0.46-0.6s boundary), **do not invent a rule** — ask, or default to the safer/more conservative
option (e.g., keep a pause rather than cut it, when genuinely unsure) and flag the uncertainty rather than
silently picking one.

## What would sharpen this playbook

More training pairs, ideally with: (a) cleaner audio for reliable ASR (the hallucination issue blocked a
lot of precision here), (b) continuous rather than sampled frame coverage so exact stumble/restart
moments can be pinpointed, (c) at least one pair with multiple *genuinely* similar-quality takes so
take-selection criteria has a real signal to find.
