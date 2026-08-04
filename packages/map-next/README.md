# map-next

## Overview

`map-next` is a SvelteKit application running in **SPA (Single Page Application) mode**. It is the new frontend rewrite of the Teikei map, built with Svelte, SvelteKit, and shadcn-svelte components.

## Development

Start the development server:

```bash
npm run dev
```

Or from the project root:

```bash
npm run dev  # starts API, Postgres, and map-next
```

## Production Builds

### Embeddable map application

The app can be built as an embeddable widget for integration into external websites:

```bash
npm run build:embed
npm run preview:embed
```

The embed contains the entire SvelteKit app with a hash router.

Preview mode shows an embedding demo.

### Widgets Build

Standalone map widgets can be built and previewed:

```bash
npm run build:widgets
npm run preview:widgets
```

Preview mode shows a widget demo page.

Use npm run build to build both the embed and widgets:

```bash


npm run build
```

## Code Organization

- **shadcn components**: `src/lib/components/shadcn/` (imported as-is)
- **Design system components**: `src/lib/components/design-system/` (custom components built on shadcn primitives)
- **Layout components**: `src/lib/components/layout/` (reusable page layouts)
- **Route-specific components**: co-located with routes in `src/routes/`
- **API layer**: `src/lib/api/` (fetch wrappers—use these instead of calling `fetch` directly)

### Sidebar navigation

The sidebar stacks three levels, and each level gets only the tools that belong to it:

- **Browse levels** (entry list): search + region filters.
- **Selected-entry level** (farm/initiative/depot profile): pivot search — selecting a
  result replaces the profile — plus back and X. Back restores the pre-detail camera and
  list scroll position; X only deselects the entry in place, leaving the map as it is.
- **Task levels** (editors, creation forms, the contact form): a single back button and
  nothing else. No search header, `focusSearch()` no-ops, and the mobile bottom sheet
  opens at `full` and cannot be collapsed — a form needs the space, and searching away
  from a half-written form would silently discard it.

## Styling

- Use shadcn theme tokens where possible
- Tailwind can be used in design system components for customization
- Route-specific components should use design system components without additional Tailwind styles
