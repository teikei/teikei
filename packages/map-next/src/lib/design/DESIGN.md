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
- `Typography.stories.svelte` — font-family tokens only; sizes and weights live in the
  `Heading` and `Paragraph` components.
- `ZIndex.stories.svelte` — the `--z-map-*` layering scale.

Each story reads CSS custom properties from the rendered preview, so token docs stay tied to
`theme-vars.css` / `layout.css` instead of becoming a second source of truth. Use Storybook's
theme switcher to compare registered `data-theme` values.
