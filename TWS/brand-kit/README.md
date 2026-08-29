# HousesBase Brand Kit

This directory contains the approved HousesBase identity system: Direction C,
Signature Base.

## Brand architecture

- Public master brand: HousesBase
- Descriptor: Software House OS
- Positioning: The operating base for modern software houses.
- Signature line: One system for projects, people, and margin.
- Primary CTA: Get started
- Nucleus: a named HousesBase capability, not an independent brand
- Tenant workspaces: tenant identity leads, with discreet “Powered by
  HousesBase” attribution where appropriate

## Start here

- `index.html` — final visual brand-kit index
- `guidelines/BRAND-GUIDELINES.md` — production usage rules
- `logos/svg/` — self-contained outlined vector artwork
- `logos/png/` — transparent raster exports
- `colors/` — brand and accessible implementation tokens
- `typography/` — approved typography hierarchy
- `messaging/` — voice and approved messaging
- `housesbase-logo-decision-preview.html` — archived decision/refinement room

## Production lockups

| Asset | Use |
| --- | --- |
| `housesbase-lockup-full-light.svg` | Full marketing lockup on light surfaces |
| `housesbase-lockup-full-dark.svg` | Full marketing lockup on dark surfaces |
| `housesbase-lockup-signature-light.svg` | Signature lockup without descriptor on light surfaces |
| `housesbase-lockup-signature-dark.svg` | Signature lockup without descriptor on dark surfaces |
| `housesbase-lockup-compact-light.svg` | Compact navigation lockup on light surfaces |
| `housesbase-lockup-compact-dark.svg` | Compact navigation lockup on dark surfaces |
| `housesbase-mark-primary.svg` | Standalone mark on light surfaces |
| `housesbase-mark-reversed.svg` | Standalone mark on dark surfaces |
| `housesbase-favicon.svg` | Browser favicon |
| `housesbase-app-icon.svg` | App icon |

Every production lockup contains one accessible SVG title and no live `<text>`
elements. The gateway, wordmark, hinge, dot, and descriptor are all outlined
vector geometry inside the asset.

## Minimum widths

- Full lockup with descriptor: 360 px
- Signature lockup with hinge and dot: 240 px
- Compact lockup: 160 px
- Standalone mark: 24 px high
- Use the dedicated favicon at 16–32 px

Below 240 px, do not use the hinge-and-dot signature wordmark. Switch to the
compact lockup or standalone mark.

## Rebuild exports

```sh
node brand-kit/tools/build-production-assets.mjs
node brand-kit/tools/build-png-exports.mjs
node brand-kit/tools/audit-production-assets.mjs
```
