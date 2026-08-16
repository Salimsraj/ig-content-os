# Reel style

Partially populated from conventions already implicit in the existing codebase (audited, not invented).
Everything else is an open scaffold.

## Known conventions (from existing code)

- Language/dialect: Arabic, Shami dialect, natural code-switching — see `brand.md`.
- Hook length: one short sentence, ~8–15 words, only what's spoken/shown in the first 2–3 seconds — see
  `hook-framework.md`.
- Production pipeline stages (from the Notion calendar's status field): Idea → Scripting → To Film → To
  Edit → Scheduled → Posted → Archived.
- On-screen overlay title is a distinct artifact from the spoken hook (see `app/api/generate-hooky-title`
  today) — a Reel can have both a spoken hook and separate on-screen text.

## Open (not yet defined)

- Typical Reel length/duration.
- Pacing conventions beyond the hook (how fast cuts happen through the body of the video).
- Structural template(s) beyond hook — is there a standard body → payoff → CTA shape, or does it vary by
  content pillar?

To fill in through conversation with the Chief of Staff, and to be refined by `video-editor` (Phase 4)
and `reel-script-writer` (Phase 3) as real patterns get confirmed.
