# Buddiz — Design System (MASTER)

**Single source of truth.** All tokens live in [`src/index.css`](../src/index.css) `:root`.
Page CSS must consume tokens — **never hardcode hex/px values**.

> Master + Overrides pattern: when a page needs to deviate, document it in
> `design-system/pages/<page>.md` (template at `pages/_template.md`). Page rules
> override this file *for that page only*.

- **Product**: craft-beer e-commerce SPA (browse, cart, favorites, profile, orders)
- **Stack**: React 19 + Vite · React Router · Context · framer-motion · lucide-react · plain CSS
- **Personality**: premium, warm, lightly playful. Green brand + amber (beer) accent.

---

## 1. Color

Brand is **green**; the **amber** from the beer artwork is the official accent.
Teal (previously `--color-secondary` / `--color-border`) was removed — it fought the brand.

### Brand
| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#2BAE66` | primary brand, links, success fills |
| `--color-primary-dark` | `#1E8048` | primary button bg, hover/pressed |
| `--color-primary-tint` | `#E7F6EE` | soft brand wash (badges, hovers) |
| `--color-secondary` | `#E7F6EE` | secondary button hover |
| `--color-accent` | `#E9A820` | amber accent (beer art, highlights) |
| `--color-accent-dark` | `#C7860C` | accent hover/pressed |
| `--color-accent-tint` | `#FEF6E0` | soft amber wash |

### Surfaces & text
| Token | Value | Notes |
|---|---|---|
| `--color-bg` | `#FFFFFF` | page background / cards |
| `--color-surface` | `#F7FAF9` | raised/section surface (warm-neutral) |
| `--color-surface-2` | `#F1F5F3` | nested surface |
| `--color-text-main` | `#111827` | body & headings — 16:1 on white |
| `--color-text-muted` | `#4B5563` | secondary text — 7.5:1 on white ✓ |
| `--color-text-subtle` | `#6B7280` | tertiary/captions — 4.8:1 ✓ |
| `--color-on-primary` | `#FFFFFF` | text/icon on primary/accent/status fills |
| `--color-border` | `#E5E7EB` | default border (neutral) |
| `--color-border-strong` | `#D1D5DB` | emphasized border |
| `--color-border-brand` | `rgba(43,174,102,.25)` | brand-tinted border |

Neutral ramp: `--neutral-50 … --neutral-900` (do not pick raw greys — use these).

### Status — base / soft bg / readable fg
Pattern: **`-bg` background + `-fg` text** for chips/banners (AA-safe);
**base** for solid fills (`color-on-primary` text) and dots.

| Intent | base | `-bg` | `-fg` |
|---|---|---|---|
| Error | `--color-error` `#DC2626` | `--color-error-bg` `#FEF2F2` | `--color-error-fg` `#991B1B` |
| Success | `--color-success` `#16A34A` | `--color-success-bg` `#F0FDF4` | `--color-success-fg` `#166534` |
| Warning | `--color-warning` `#F59E0B` | `--color-warning-bg` `#FFF8E1` | `--color-warning-fg` `#92400E` |
| Info | `--color-info` `#2563EB` | `--color-info-bg` `#EFF6FF` | `--color-info-fg` `#1E40AF` |

> `--color-error` was darkened `#EF4444 → #DC2626` so error **text** clears 4.5:1 on white.

**Rule:** never convey state by color alone — pair with icon/label (`color-not-only`).

---

## 2. Typography

Self-hosted **Inter** (`@fontsource/inter`, weights 400/500/600/700/800, `display: swap`),
imported in [`src/main.jsx`](../src/main.jsx) before `index.css`.
Fallback stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.

| Token | rem / px | Typical role |
|---|---|---|
| `--text-xs` | 0.75 / 12 | legal, tiny labels (min for non-body) |
| `--text-sm` | 0.875 / 14 | captions, secondary |
| `--text-base` | 1 / 16 | **body baseline — never smaller on mobile** |
| `--text-md` | 1.125 / 18 | lead paragraph |
| `--text-lg` | 1.25 / 20 | card titles |
| `--text-xl` | 1.5 / 24 | section sub-heads |
| `--text-2xl` | 1.875 / 30 | section titles |
| `--text-3xl` | 2.25 / 36 | page titles |
| `--text-4xl` | 3 / 48 | hero (use `clamp()` for fluid hero) |

Line height: `--leading-tight 1.2` (display) · `--leading-snug 1.35` · `--leading-normal 1.5` (body) · `--leading-relaxed 1.7`.
Weight: `--weight-regular 400` body · `--weight-medium 500` labels · `--weight-semibold 600` headings · `--weight-bold 700` CTAs · `--weight-extrabold 800` hero.
Headings ship `letter-spacing: -0.02em` globally (see `index.css`). Body measure 60–75ch desktop / 35–60ch mobile.

---

## 3. Spacing, Radius, Elevation, Z-index, Motion

**Spacing** — canonical numeric 4/8 scale; named tokens are aliases:
`--space-1 4` · `2 8` · `3 12` · `4 16` · `5 20` · `6 24` · `8 32` · `10 40` · `12 48` · `16 64` · `24 96`.
Aliases: `--spacing-xs/sm/md/lg/xl/2xl` → 4/8/16/24/32/64.
Section rhythm tiers: 16 / 24 / 32 / 48.

**Radius**: `--radius-sm 12` (inputs/badges) · `--radius-md 20` (buttons/cards) · `--radius-lg 28` (large cards) · `--radius-full` (pills/avatars).

**Elevation**: `--shadow-xs` (hairline) · `--shadow-sm` (cards) · `--shadow-md` (raised/sheets) · `--shadow-lg` (modals) · `--shadow-glow` (brand emphasis). Don't invent shadow values.

**Z-index**: `--z-base 0` · `--z-dropdown 10` · `--z-sticky 20` · `--z-overlay 40` · `--z-modal 100` · `--z-toast 1000`.
> Known debt: `TopNav`/`Toast`/`.skip-link` still use raw `z-index: 9999`. Migrate to scale when touched.

**Motion**: `--dur-fast 150ms` (micro) · `--dur-base 250ms` · `--dur-slow 400ms`.
Easing: `--ease-out` (enter) · `--ease-in` (exit) · `--ease-in-out`. Exit ~60–70% of enter.
Animate `transform`/`opacity` only. `prefers-reduced-motion` is globally honored in `index.css` and via `useReducedMotion()` in framer-motion code.

---

## 4. Components (current conventions)

- **Buttons** (`index.css`): `.btn-primary` (dark-green fill, white text), `.btn-secondary` (outline), `.btn-danger` (`--color-error`), `.btn-icon` (44×44 min, circular). One primary CTA per screen; secondary subordinate.
- **Touch**: interactive targets ≥ 44×44px (`.btn-icon` enforces it). 8px+ gaps.
- **Nav**: `TopNav` (desktop, ≥768px) + `BottomNav` (mobile, ≤5 items, icon+label). Active state highlighted. Body reserves `80px + safe-area` bottom padding on mobile, `64px` top on desktop.
- **Feedback**: `Toast` (success/error, auto-dismiss). Status pills use `-bg`/`-fg` pairs.
- **Icons**: **lucide-react only** — no emoji as icons. Consistent stroke/size.
- **Focus**: global `:focus-visible` ring (`2px solid --color-primary`). Never remove.

---

## 5. Dark mode (scaffolded, OFF)

A `[data-theme="dark"]` token block exists in `index.css` (surfaces/text/border remapped,
brand hues lightened for contrast). **Not enabled** — needs per-page contrast testing first.
To enable later: add `data-theme="dark"` on `<html>` (or switch the block to
`@media (prefers-color-scheme: dark)`) and verify every page against §6.

---

## 6. Accessibility & quality checklist (per change)

- [ ] Body text ≥ 16px; text contrast ≥ 4.5:1 (large/UI glyphs ≥ 3:1)
- [ ] State never by color alone (icon/label too)
- [ ] Touch targets ≥ 44×44px, ≥ 8px apart
- [ ] Visible focus ring; tab order matches visual order
- [ ] Icon-only buttons have `aria-label`; meaningful images have `alt`
- [ ] Animations: transform/opacity, 150–300ms, respect reduced-motion
- [ ] No raw hex/px in page CSS — use tokens
- [ ] No horizontal scroll at 375px; safe areas respected
- [ ] Forms: visible labels, error below field, semantic input types

### Anti-patterns (do not)
Emoji as icons · removing focus rings · placeholder-as-label · gray-on-gray ·
raw hex in components · teal greys (off-brand) · `#EF4444` for error text (too light) ·
animating width/height/top/left · mixing nav patterns at one hierarchy level.
