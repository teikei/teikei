# Design System

This package uses structured design tokens as the source of truth, CSS custom properties as the runtime theme layer, and short markdown files as component-level documentation.

## Token Source

- `src/lib/design/themes/*.ts` contains one editable token source file per theme.
- `src/lib/design/tokens.ts` provides the typed theme registry for Svelte and TypeScript code.
- `src/lib/design/theme-css.ts` renders the CSS variable output used by the generator.
- `src/lib/design/generated/theme-vars.css` is generated from the TypeScript token source and imported by `src/routes/layout.css`.
- `src/routes/map-style.ts` consumes the same typed theme tokens for the VersaTiles/MapLibre style.

After changing a theme file, run:

```sh
npm run design:css
```

## Token Shape

Each theme has:

- `cssVars`: semantic UI tokens exposed as CSS variables for Tailwind and shadcn-svelte.
- `map`: tokens used from TypeScript when building the map style.

Use semantic tokens in components:

```svelte
<div class="bg-background text-foreground border-border">
```

Avoid raw color values in components unless the value is local, non-themeable data visualization.

## Client Themes

The default theme is `teikei`. Additional client themes can be added in `src/lib/design/themes/` and registered in `src/lib/design/tokens.ts`.

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

The loader copies the theme to the Shadow DOM host and wrapper. The Svelte app reads the same value through embed configuration, so CSS and map tokens stay aligned.

## Component Docs

Design-system components should have short docs next to the component folder when their usage is not obvious:

```txt
src/lib/components/shared/forms/FormInput.docs.md
src/lib/components/shared/typography/Heading.docs.md
```

Suggested sections:

- Purpose
- Use When
- Avoid When
- Props
- Variants
- Examples

Keep these files practical. They are for humans and agents choosing the right component, not long-form implementation notes.

## Component Catalog

`src/routes/__catalog/+page.svelte` is a small browseable catalog for local development. Add high-signal examples there when introducing or changing reusable design-system components.
