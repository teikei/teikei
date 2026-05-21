# Design System

This package uses CSS custom properties as the source of truth for design tokens and short markdown files as component-level documentation.

## Token Source

- `src/lib/design/theme-vars.css` contains one editable CSS variable rule per theme.
- `src/lib/design/themes.ts` provides the typed theme id registry and helpers for reading map tokens from computed CSS variables.
- `src/routes/layout.css` imports the token CSS and exposes semantic tokens to Tailwind.
- `src/routes/map-style.ts` consumes map tokens read from the mounted app element for the VersaTiles/MapLibre style.

## Token Shape

Each theme has:

- `base`: layer 1 design tokens. Raw color, radius, and font values live here.
- `semantic`: layer 2 design tokens. These alias base by meaning and are the runtime
  source for Tailwind utilities.
- `shadcn`: compatibility aliases for shadcn-svelte variables like `card`, `popover`, and
  `sidebar`. These must point at semantic tokens, not base.
- `map`: semantic CSS variables read from TypeScript when building the map style.

Use semantic tokens in components:

```svelte
<div class="bg-background text-foreground border-border">
```

Avoid raw color values and Tailwind default palette utilities in components. Add a semantic
token first, then expose it through `src/routes/layout.css` if it needs a Tailwind utility.

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

Storybook documents the active semantic color tokens in `src/lib/design/Colors.stories.svelte`.
The story reads CSS custom properties from the rendered preview, so token docs stay tied to
`theme-vars.css` instead of becoming a second source of truth.

Use Storybook's theme switcher to compare registered `data-theme` values.
