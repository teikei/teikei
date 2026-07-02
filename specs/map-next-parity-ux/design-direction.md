# Design Direction — map-next (Track C)

Distilled from the non-normative concept screenshots in `design-references/` (see the README
there for their status) plus the goals in `spec.md`: a polished shadcn app in the spirit of
Google Maps / Airbnb / Booking.com, carrying the brand mood of the concept — **not** a
reimplementation of the concept screens.

Much of the concept's DNA is already encoded in `packages/map-next/src/lib/design/theme-vars.css`
(deep-green map base `#266050`, peach place markers `#ffc8af`, salmon clusters `#ffa08c`,
olive-tinted neutrals). This document confirms that direction and refines it; implementation
lands in `theme-vars.css`, `DESIGN.md`, and the Storybook token stories — not here.

## Mood

Earthy, warm, calm, editorial, quietly illustrated. The signature move of the concept is
**figure–ground contrast**: a muted monochrome deep-green map on which only the warm
peach/salmon markers and white surfaces carry saliency. Nothing on the map competes with the
places. Surfaces are flat and unfussy; density is generous but not cramped.

Keywords for implementing agents: _warm green, cream paper, peach accents, flat two-tone
illustration, editorial serif touches, no gradients, no glassmorphism, restrained shadows._

## Color foundations

Observed in the concept → mapped onto the existing token architecture (base → semantic).
Values are candidates to validate against contrast requirements, not literal requirements.

| Concept role                         | Approx. value seen           | Token mapping (candidate)                                                                                                                                                                              |
| ------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brand/header deep green              | ≈ `#2C5E51`                  | `--primary` today is `--base-color-green-600` (more saturated grass green); consider shifting toward the deeper, calmer brand green for `--primary` and dark surfaces (`--map-popup` is already close) |
| Map base green                       | ≈ `#3A7263`                  | `--map-base` (`#266050`) — keep; landcover/water as lighter tints of the same hue, roads as darker ink-green lines (already the map-style approach)                                                    |
| Marker peach (light)                 | ≈ `#F8C1A8`                  | `--map-place-primary` (`#ffc8af`) — keep                                                                                                                                                               |
| Marker salmon (dark half / clusters) | ≈ `#F2977F`                  | `--map-cluster-primary` (`#ffa08c`) — keep; also candidate for marker hover/selected emphasis (spec F13)                                                                                               |
| Count badge coral-red                | ≈ `#F4695B`                  | candidate for cluster count badges; distinct from `--destructive`                                                                                                                                      |
| Panel cream                          | ≈ `#EDF0EB` (warm off-white) | today `--background`/`--card` are pure white with `--muted` olive-100; consider the cream as `--sidebar`/`--background` so cards (white) read as elevated on paper, like the concept's panel           |
| Ink text on light                    | very dark warm green-black   | `--foreground` (olive-950) — keep                                                                                                                                                                      |
| Link/accent green                    | ≈ `#3F7A63`                  | align with the adjusted `--primary`                                                                                                                                                                    |

Principles:

- **One green family, one peach family.** No additional hues except semantic status colors
  (`--success`, `--warning`, `--destructive`) used sparingly in UI, never on the map canvas.
- **The map stays monochrome green in all themes**; markers and selection states are the only
  warm elements. Any new map layer (network lines, F6; highlights, F13) uses tokens from the
  peach/salmon family or a lighter green tint — never blue/red defaults.
- Client themes keep the same structure (swap base values only).

## Typography

The concept pairs a **bold humanist/condensed sans** for headings, labels, and UI with a
**bookish serif** for body copy, addresses, dates, and links (often italic). That editorial
mix is distinctive and worth keeping _in moderation_:

- UI stays sans (`Inter`, already tokenized): controls, labels, cards, navigation, forms.
- **Optional, deliberate serif accent**: profile description text and similar long-form
  content (the "editorial voice" of a farm talking about itself) may use a serif via a new
  `--font-family-serif` base token and a `Paragraph` variant. Decide once, apply
  consistently through the `typography/` components — never ad-hoc per route. If in doubt or
  if it clashes with i18n/rendering, all-sans is the safe default; do not mix serif into
  controls, buttons, or list cards.

## Iconography & illustration

- The two-tone flat pictograms (barn = farm, tote bag = depot/pickup point, waving hand =
  initiative) are the brand's most recognizable asset and already exist in
  `src/lib/assets/markers/`. Keep them as the marker/entry-type language, and reuse the same
  two-tone flat style for empty states and onboarding illustrations (F11, F14) instead of
  generic lucide art or stock illustration.
- Lucide icons remain the utility icon set for UI chrome (search, close, chevrons, actions).
- The concept's dark-green speech-bubble popup with white title / serif subtitle is a good
  reference for popup styling (F13) — but restyle on card/popup tokens rather than copying
  the 0.8-opacity overlay of the current implementation.

## Component-level cues worth carrying over

These align with, and add flavor to, spec Track C — the spec remains the source of truth:

- **Search bar**: floating white bar on the map/panel with a leading country selector and a
  clear (×) affordance — matches the drawer-header search of F10.
- **Product chips**: outline pills for products/goals on profiles (F12 already specs chips).
- **Primary CTA**: solid deep-green button ("Kontakt") as the single strong action on a
  profile (F12's sticky contact CTA).
- **Cards**: flat white cards on the cream panel, chevron affordance, subtle elevation only
  for the selected/hovered card (F11's hover ↔ marker coupling can reuse this elevated state).
- **Detail header**: breadcrumb-style back path + close in the concept ≙ the slim persistent
  header (back + search) of F10/F12.
- **Mobile**: the concept's three mobile screens map 1:1 onto F5's snap points — full map
  with a slim "show list" bottom bar (peek), list sheet (half/full), detail sheet with map
  still visible above (half). Good visual reference for proportions.
- **Clusters**: the concept shows grouped type-icons in a translucent darker-green circle;
  adopt the _coloring_ (translucent green circle, peach content, coral count badge), not
  necessarily the multi-icon composition.

## Ignore (superseded or out of scope)

- The green **top navigation bar** and its marketing links — map-next is a full-bleed map
  with floating chrome.
- **News feeds and subscriptions** ("Neuigkeiten abonnieren", "Neues aus dieser Region /
  diesem Betrieb", count badges on markers) — not part of the product scope; the coral badge
  style may be reused for cluster counts only.
- The **add-entry dropdown** ("Eintrag hinzufügen/bearbeiten") — superseded by my-entries +
  farm-profile creation flows (spec F8).
- **Near-square corner radii and exact spacing/layout** — radius and spacing come from the
  shadcn token scale (`--base-radius`, F14's consistency pass), not from the mockups.
- The split-screen **register page layout** — auth flows keep their current dialog/panel
  pattern; only palette and type mood apply.
- Any implication that depots are a separate top-level browsing category ("Abholstellen"
  accordions) — superseded by F8 (depots live on the farm profile).
