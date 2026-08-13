# Design Bundle — "Claude-style" (orange + creamy white)

Brand style: warm terracotta orange accent on a creamy off-white background, standard bold sans headlines. Modeled after Claude's own look, with common, easy-to-read carousel fonts.

## Colors

| Token | Hex | Use |
|---|---|---|
| `--brand-primary` | `#CC785C` | Main accent: progress bar, icons, tags |
| `--brand-light` | `#E8A489` | Secondary accent: tags on dark, pills |
| `--brand-dark` | `#9C5A42` | CTA text, gradient anchor |
| `--light-bg` | `#F0EEE6` | Light slide background (creamy off-white) |
| `--light-border` | `#E3DFD3` | Dividers on light slides |
| `--dark-bg` | `#1A1918` | Dark slide background (warm near-black) |

Gradient (for gradient slides): `linear-gradient(165deg, #9C5A42 0%, #CC785C 50%, #E8A489 100%)`

## Fonts

- Headings: **Montserrat** (weight 800, bold sans — a standard choice across IG carousel templates)
- Body / labels: **Inter** (clean sans)

## Usage

Every carousel slide should link `ds-bundle/styles.css` and use the CSS classes `.serif` (headings) and `.sans` (body/labels), with colors pulled from `tokens/tokens.css`.
