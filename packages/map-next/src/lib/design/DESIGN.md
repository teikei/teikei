# Design System

This package uses CSS custom properties as the source of truth for design tokens and short markdown files as component-level documentation.

## Token Source

- `src/lib/design/theme-vars.css` contains one editable CSS variable rule per theme.
- `src/lib/design/themes.ts` provides the typed theme id registry and helpers for reading map tokens from computed CSS variables.
- `src/routes/layout.css` imports the token CSS and exposes semantic tokens to Tailwind.
- `src/routes/map-style.ts` consumes map tokens read from the mounted app element for the VersaTiles/MapLibre style.

## Token Shape

Tokens live in two layers, both defined per theme in `theme-vars.css`:

- **Base** (`--base-*`): layer 1. The literal color (oklch/hex), radius, and font values.
  These are only referenced by semantic tokens, never used directly in components.
- **Semantic**: layer 2. Plainly named tokens that alias base values by meaning and are the
  runtime source for Tailwind utilities. They use unprefixed names (there is no
  `--semantic-*` prefix) and group into:
  - shadcn-svelte tokens: `--background`, `--foreground`, `--card`, `--popover`, `--primary`,
    `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`,
    `--chart-*`, `--sidebar*`.
  - app tokens: `--success*`, `--warning`, `--overlay`, `--auth-panel`, `--separator`,
    `--control-border`, `--chip-*`.
  - map tokens: `--map-base`, `--map-place-*`, `--map-cluster-*`, `--map-popup`,
    `--map-font-*`, read from TypeScript in `map-style.ts` when building the map style.

Semantic tokens alias base **directly** (e.g. `--primary: var(--base-color-green-600)`); there
is no separate intermediate layer. `layout.css` re-exports them to Tailwind via `@theme inline`
(e.g. `--color-primary: var(--primary)`), which generates utilities like `bg-primary`.

Use semantic tokens in components:

```svelte
<div class="bg-background text-foreground border-border">
```

Avoid raw color values, `--base-*` tokens, and Tailwind default palette utilities in
components. Add a semantic token first, then expose it through `src/routes/layout.css` if it
needs a Tailwind utility.

## Color Direction (Track C decisions)

Decided once during the F14 consistency pass (see `specs/map-next-parity-ux/design-direction.md`):

- **`--primary` is the deep, calm brand green** (`--base-color-brand-600`, ≈ `#2c5e51`), not the
  saturated grass green. The grass green (`--base-color-green-600`) stays reserved for
  `--success` so status feedback reads distinctly from brand chrome.
- **The drawer panel is cream paper**: `--sidebar` and `--auth-panel` use
  `--base-color-cream-100` (warm off-white ≈ `#edf0eb`), so white `--card` surfaces read as
  elevated on paper. `--background` stays white (it is only visible behind the map canvas).
- **One green family, one peach family**: markers/clusters/network lines use the `--map-*`
  peach/salmon tokens (coral count badge `--map-cluster-count`); no new hues in components
  beyond the semantic status colors.
- Neutrals are olive-tinted (`--base-color-olive-*`), not cool grays.

## Typography Direction

- UI is sans (`--font-family-sans`, Inter) everywhere: controls, labels, cards, navigation,
  profile descriptions, and the onboarding intro.
- **Serif accent (dropped)**: F14 introduced `Paragraph serif` for editorial long-form voice
  (profile descriptions, onboarding intro), but the design-consistency pass removed it —
  it rendered inconsistently and read as accidental. `--font-family-serif`/`--font-serif`
  stay defined in `theme-vars.css` but are unreferenced by any component; do not reintroduce
  `font-serif` on controls, labels, buttons, or list cards.

## Control Hierarchy (border contrast)

Interactive controls read at two altitudes, distinguished by resting border contrast:

- **Shell controls** (first-level chrome): navigation/save/outline+secondary buttons and the
  region-filter select. They use the darker `--control-border` (`--base-color-olive-600`),
  which keeps ≥3:1 contrast against both the cream `--sidebar` and white `--card` so the
  primary chrome stays legible and distinct.
- **Form controls** (second-level): inputs, textareas, form selects, checkboxes, radios,
  input-groups. They use the softer `--input` border (`--base-color-olive-200`) over a faint
  `bg-input/50` fill — a quieter, filled luma-style field that recedes below the shell.

The region-filter select reuses the shared `ui/select` trigger but opts back into the full
shell look inline (`RegionFilters.svelte`) — `border-control-border` **and** the generous
`rounded-2xl` shell radius, matching the nav buttons — because it is shell chrome, not a form
field. Keeping both signals aligned (strong border + generous round) is deliberate: a
shell-strength border on a form-radius (`rounded-lg`) corner reads as a half-promoted "mixed
signal" next to the fully-rounded nav buttons and search pill. When adding a control, default to
the form (soft) look; only reach for the shell treatment for genuine first-level chrome, and
take both the border and the radius together.

## Radius & Elevation

Radius reinforces the same two altitudes (Tailwind utilities generated from `--radius`):
container surfaces keep the large signature radius; shell buttons stay pill-soft; form controls
step down to a calmer corner; anything nested inside a container steps down further. Adjacent
tiers land on different utilities so a control never reads as flush with a list row or menu item
sitting next to it.

| Tier            | Utility       | Used by                                                                                                                             |
| --------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Container       | `rounded-4xl` | Cards, dialogs/sheets, the desktop sidebar shell, the bottom sheet (top corners), the search pill, MapLibre control group           |
| Shell control   | `rounded-2xl` | Buttons (nav/save/outline/secondary/ghost), the region-filter select (`RegionFilters.svelte`)                                       |
| Form control    | `rounded-lg`  | Inputs, textareas, select + input-group triggers (checkboxes/radios keep their small `rounded-[5px]`/`rounded-full` shapes)         |
| Control popover | `rounded-xl`  | select/dropdown-menu content, search/geocoder suggestion popovers                                                                   |
| Nested          | `rounded-md`  | List/entry rows, depot cards inside a farm profile, profile chips (products, goals, membership), dropdown-menu/select/command items |

`rounded-2xl` sits outside this ladder as a pre-existing outlier (sidebar floating/inset
corners, alerts, skeletons, field-label) — not yet migrated to a tier, not safe to repurpose.

Buttons are never full pills — `rounded-xl` is a soft corner, not `rounded-full`. Small chip-like
elements (association/certification badges, `kbd` hints) are an intentional exception and use
`rounded-full` since at their height any of the ladder's larger steps would round out to a pill
anyway. **Profile chips** (`display/Chip`: farm product chips, initiative goal chips, the membership
status) are the deliberate counter-example: they are filled and tinted (`--chip-*`,
`--success-muted`, `--warning`, `--destructive`), so they share one look on the nested
`rounded-md` tier and read as tags rather than status pills.

Elevation (Tailwind `shadow-*`):

| Level     | Utility     | Used by                                                          |
| --------- | ----------- | ---------------------------------------------------------------- |
| Resting   | `shadow-md` | Cards, sidebar shell, bottom sheet, user-nav pills, map controls |
| Transient | `shadow-lg` | Dropdowns, select/command popovers                               |
| Modal     | `shadow-xl` | Dialogs, sheets                                                  |

MapLibre's native controls are aligned to the same tokens via scoped global CSS in
`src/routes/Map.svelte` (they cannot take Tailwind classes).

## Spacing

Spacing is not tokenized — the package uses Tailwind's default spacing scale, constrained to an
**8pt grid with 4pt half-steps**. App-level markup (everything outside `components/ui/`) uses
only these steps:

| Step    | Utilities        | Px  | Used for                                                                |
| ------- | ---------------- | --- | ----------------------------------------------------------------------- |
| micro   | `gap-1` / `p-1`  | 4   | icon ↔ label, title ↔ meta line inside a text cluster                   |
| tight   | `gap-2` / `p-2`  | 8   | inline label (`Heading level={6}`) → content, chip wraps, checkbox rows |
| heading | `gap-3`          | 12  | section heading → section body (`ProfileSection`)                       |
| block   | `gap-4` / `p-4`  | 16  | between blocks/fields inside a section, drawer content padding          |
| section | `py-6` / `gap-6` | 24  | around section separators, intro → first section                        |
| page    | `p-8`+           | 32+ | page-level offsets                                                      |

Values of 16px and above must land on the 8-grid (16/24/32/48…) — no `gap-5`, `p-7`, `py-10`.
Below 16px the 4pt half-steps (4/8/12) are allowed; avoid `*-1.5` / `*-2.5` (6/10px) in app
components. The vendored shadcn-svelte primitives in `components/ui/` keep their internal 2px
steps (`py-1.5`, `gap-1.5` control padding) — do not "fix" them; compose `Card`, `Field`, and
`FieldGroup` instead of re-padding.

Profile/editor vertical rhythm (read and edit mode share it by construction):

- 24px above/below each section separator (`divide-y divide-separator` + `[&>*]:py-6`)
- 12px between a section heading and its body
- 16px between blocks in read mode and between fields in edit mode
- 8px between an inline `Heading level={6}` label and its content
- 4px inside text clusters (name → meta line)

Section separators, the sticky save bar, and drawer header/footer borders use the `--separator`
token (`divide-separator` / `border-separator`), a mid-tone neutral that stays readable on the
cream `--sidebar` panel; `--border` (olive-200) remains the default for component borders on
white surfaces.

## Profile Sections (read/edit parity)

Entry profiles render the **same `ProfileSection` body sequence in read and edit mode** — same
order and wording; only each section's body swaps between display markup and form controls
(`src/lib/components/domain/entries/sections/ProfileSection.svelte`). Edit mode shows exactly one
Cancel and one Save control (the sticky `EditorSaveBar`), never a second Cancel in the header.

Two deliberate read/edit divergences:

- **Identity is header-only in read mode.** The entry name is the drawer-header heading in both
  modes; in read mode the location and website line up under it in the header too, so the
  Identity _section_ (name/url/address fields) renders only in edit mode. The membership status
  likewise moved out of the header into the Membership section, as a tinted profile chip.
- **Description and the product "additional info" have no heading in read mode** — they read as
  plain prose. The `editor_section_description` heading is kept in edit mode only, to label the
  otherwise-unlabelled textarea.

Canonical section list (heading message key → de-de value; "—" = section renders without a
heading in both modes; "edit only" = heading appears only in edit mode). In read mode a section
is skipped entirely when it has no content; checkbox-group legends in edit mode are `sr-only`
duplicates of the section heading.

**Farm** (`FarmProfile.svelte`):

| #   | Section     | Heading key                  | de-de                    |
| --- | ----------- | ---------------------------- | ------------------------ |
| 1   | Identity    | — (header-only in read)      | — (name/address/website) |
| 2   | Description | `editor_section_description` | Beschreibung (edit only) |
| 3   | Products    | `editor_section_products`    | Lebensmittelangebot      |
| 4   | Economic    | `editor_section_economic`    | Wirtschaftsweise         |
| 5   | Membership  | `editor_section_membership`  | Mitgliedschaft           |
| 6   | Badges      | `editor_section_badges`      | Verbände und Netzwerke   |
| 7   | Depots      | `details_connected_depots`   | Abholstellen (Depots)    |

**Initiative** (`InitiativeProfile.svelte`):

| #   | Section     | Heading key                  | de-de                    |
| --- | ----------- | ---------------------------- | ------------------------ |
| 1   | Identity    | — (header-only in read)      | —                        |
| 2   | Description | `editor_section_description` | Beschreibung (edit only) |
| 3   | Goals       | `editor_section_goals`       | Wir suchen               |
| 4   | Badges      | `editor_section_badges`      | Verbände und Netzwerke   |

One term per section: field labels inside a section may differ from the heading (e.g.
"Erläuterungen zur Wirtschaftsweise" under "Wirtschaftsweise"), but the same concept must never
carry two names across modes (e.g. participation is "Mitgliederbeteiligung" in both the read
subheading and the edit field label — `editor_field_participation`).

## Client Themes

The default theme is `teikei`. Additional client themes can be added to `src/lib/design/theme-vars.css` and registered in `src/lib/design/themes.ts`.

Embeds can select a theme on the host element:

```html
<div id="teikei-app" data-theme="client-demo"></div>
```

or on the loader script:

```html
<script
	type="module"
	src="/teikei-loader.js"
	data-js="/main.js"
	data-host="#teikei-app"
	data-theme="client-demo"
></script>
```

The loader copies the theme to the Shadow DOM host and wrapper. The Svelte app reads the same value through embed configuration, and map tokens are read from computed CSS variables on the mounted app element.

## Component Docs

Design-system components should have short docs next to the component folder when their usage is not obvious:

```txt
src/lib/components/forms/FormInput.docs.md
src/lib/components/typography/Heading.docs.md
```

Suggested sections:

- Purpose
- Use When
- Avoid When
- Props
- Variants
- Examples

Keep these files practical. They are for humans and agents choosing the right component, not long-form implementation notes.

## Storybook Token Docs

Storybook documents the active tokens under `Design System/Tokens`, in `src/lib/design/`:

- `Colors.stories.svelte` — semantic color tokens.
- `Radius.stories.svelte` — the `--base-radius` scale and derived `--radius-*` steps.
- `Elevation.stories.svelte` — the three-step `shadow-*` ladder for floating chrome.
- `Typography.stories.svelte` — font-family tokens only (sans, heading, serif accent); sizes
  and weights live in the `Heading` and `Paragraph` components.
- `ZIndex.stories.svelte` — the `--z-map-*` layering scale.

Each story reads CSS custom properties from the rendered preview, so token docs stay tied to
`theme-vars.css` / `layout.css` instead of becoming a second source of truth. Use Storybook's
theme switcher to compare registered `data-theme` values.
