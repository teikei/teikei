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
  - app tokens: `--success*`, `--warning`, `--overlay`, `--auth-panel`.
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

- UI is sans (`--font-family-sans`, Inter) everywhere: controls, labels, cards, navigation.
- **Serif accent (adopted in F14)**: `--font-family-serif` (system bookish serif stack, no
  webfont cost) is used for editorial long-form voice only — profile description text and the
  onboarding intro — applied exclusively through `Paragraph serif` from `typography/`. Never
  use `font-serif` on controls, labels, buttons, or list cards.

## Radius & Elevation

Radius follows a two-tier rule (Tailwind utilities generated from `--radius`): container
surfaces keep the large signature radius; controls and their popovers, plus anything nested
inside a container, both step down. Controls and nested elements land on different utilities
(`rounded-xl` vs `rounded-md`) so a button/input never reads as flush with a list row or menu
item sitting next to it.

| Tier      | Utility       | Used by                                                                                                                          |
| --------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Container | `rounded-4xl` | Cards, dialogs/sheets, the desktop sidebar shell, the bottom sheet (top corners), the search pill, MapLibre control group        |
| Control   | `rounded-xl`  | Buttons, inputs, textareas, selects (trigger + content), dropdown-menu content, search/geocoder suggestion popovers, input-group |
| Nested    | `rounded-md`  | List/entry rows, depot cards inside a farm profile, dropdown-menu/select/command items                                           |

`rounded-2xl` sits outside this ladder as a pre-existing outlier (sidebar floating/inset
corners, alerts, skeletons, field-label) — not yet migrated to a tier, not safe to repurpose.

Buttons are never full pills — `rounded-xl` is a soft corner, not `rounded-full`. Small chip-like
elements (badges, `kbd` hints) are an intentional exception and use `rounded-full` since at their
height any of the ladder's larger steps would round out to a pill anyway.

Elevation (Tailwind `shadow-*`):

| Level     | Utility     | Used by                                                          |
| --------- | ----------- | ---------------------------------------------------------------- |
| Resting   | `shadow-md` | Cards, sidebar shell, bottom sheet, user-nav pills, map controls |
| Transient | `shadow-lg` | Dropdowns, select/command popovers                               |
| Modal     | `shadow-xl` | Dialogs, sheets                                                  |

MapLibre's native controls are aligned to the same tokens via scoped global CSS in
`src/routes/Map.svelte` (they cannot take Tailwind classes).

## Spacing

Spacing is not tokenized — the package uses Tailwind's default spacing scale. Component-internal
spacing (padding, label/control rhythm, section gaps) is encoded in the shadcn-svelte primitives
such as `Card`, `Field`, and `FieldGroup`; compose them instead of re-padding. For layout gaps
between components, stick to the `gap-2` / `gap-4` / `gap-6` ladder (occasionally `gap-3`) that
shadcn uses, and avoid one-off values like `gap-5` or `p-7`.

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
