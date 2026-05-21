# Component Hierarchy

This directory uses an atomic-design-inspired hierarchy without naming folders
after atomic design layers. Folder names describe the UI domain they serve, while
the layering rules describe how components depend on each other.

## Layers

### Primitives

Location: `ui/`

These are shadcn-svelte components copied into the project. They are equivalent
to atoms in atomic design: low-level building blocks such as buttons, fields,
inputs, dialogs, sheets, and menus.

Use primitives to build design-system components. Route components should avoid
importing from `ui/` directly when a semantic component exists.

Primitives may expose more variants than the application wants to support. Those
variants are implementation details unless a higher-level component makes them
part of the app design system.

### Design-System Components

Locations: `actions/`, `forms/`, `typography/`, `feedback/`, and similar
semantic folders.

These are equivalent to molecules in atomic design. They compose primitives into
application-level APIs with restricted props, consistent behavior, and stable
visual language.

Examples:

- `actions/AppButton.svelte` exposes only the app-supported button variants.
- `actions/IconButton.svelte` gives icon-only actions a fixed accessible API.
- `forms/FormInput.svelte` combines field, label, input, and error wiring.
- `typography/Heading.svelte` keeps heading styles consistent.

Prefer semantic props over raw styling hooks. Consumers should not need to know
which shadcn variant or Tailwind class creates the intended appearance.

### Layout Components

Location: `layout/`

These are reusable page and application structures. They correspond roughly to
organisms and templates, but this project keeps the semantic `layout` name to
avoid classification debates.

Layout components may compose primitives and design-system components, but they
should not contain route-specific data-fetching or business logic.

### Route Components

Location: `../../routes/**`

Route-specific components stay colocated with their routes. They can compose
layout components and design-system components. If route code needs repeated UI
composition, promote that composition into a semantic folder under
`lib/components`.

## Import Rules

- `ui/` components are primitives. Treat them as internal building blocks.
- Primitive implementation files under `ui/` may compose other primitives.
- Shared app UI should expose semantic components from folders such as
  `actions/`, `forms/`, `typography/`, or `layout/`.
- Route components should use semantic components when available.
- Do not create folders named `atoms`, `molecules`, `organisms`, or `templates`;
  use domain names and document the layer here instead.

## Button Policy

Use `actions/AppButton.svelte` for application buttons. It wraps the shadcn
button primitive and intentionally exposes only:

- `variant="default"`
- `variant="outline"`

It does not expose a `size` prop. If a new button style or size is needed, add it
to `AppButton` deliberately and document the intended use before adopting it in
routes.

The lower-level shadcn `ui/button` still contains upstream variants such as
`secondary`, `ghost`, `destructive`, and `link` because those are part of the
primitive implementation. They are not approved app-level variants unless
`AppButton` exposes them.

Use `actions/IconButton.svelte` for icon-only actions. It wraps the same shadcn
button primitive, fixes the size to the icon button size, and requires a visible
API label so every icon-only control has an accessible name.

## Documentation

Storybook documents component examples and allowed variants. Add stories next to
the component they document, named `ComponentName.stories.svelte`, and tag public
design-system component stories with `autodocs`.

Component `.docs.md` files can still capture design rationale that does not fit
well in a story. The `routes/__design` catalog remains useful as an in-app smoke
test for app-level theme rendering.
