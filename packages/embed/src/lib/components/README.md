# Component Hierarchy

This directory uses an atomic-design-inspired hierarchy without naming folders
after atomic design layers. Folder names describe the UI domain they serve, while
the layering rules describe how components depend on each other.

Dependencies point **downward only**:

```
routes/  →  domain/  →  { actions, forms, typography, layout }  →  ui/
```

A layer may import from the layers below it, never from the layers above it.

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
- `forms/FormTextarea.svelte` gives multiline text fields the same field and
  validation composition as inputs.
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

### Domain Components

Location: `domain/<feature>/` — e.g. `domain/entries/`, `domain/farms/`,
`domain/initiatives/`, `domain/depots/`, `domain/map/`.

These compose primitives, design-system, and layout components into the
application's **business domain** UI: entry detail/editor views, the map sidebar
and its controls, marker/popup rendering, and so on. They may hold view state
and call domain APIs, but the route owns data loading and URL/navigation state.

Domain components are reusable and documented (Storybook stories live next to
them). Cross-domain composition is fine and expected (e.g. `farms/FarmProfile`
renders `farms/sections`); keep the dependency direction acyclic.

### Route Components

Location: `../../routes/**`

Routes own routing, data loading (`+page.ts`), and state/navigation wiring. They
compose domain, layout, and design-system components.

Co-location is allowed but should stay **rare**: a component may live next to its
route only if it is used by exactly that one route **and** is not worth a story.
The moment a component is reused across routes, or gains a Storybook story,
promote it — design-system pieces to a semantic folder, business UI to
`domain/<feature>/`. (The always-on app shell `routes/Map.svelte` and
`routes/MapSidebar.svelte` are the composition root and stay in `routes/`; their
reusable parts live under `domain/`.)

## Import Rules

- `ui/` components are primitives. Treat them as internal building blocks.
- Primitive implementation files under `ui/` may compose other primitives.
- Shared app UI should expose semantic components from folders such as
  `actions/`, `forms/`, `typography/`, or `layout/`; business UI from
  `domain/<feature>/`.
- Route and domain components should use semantic components when one exists, and
  avoid importing from `ui/` directly when a semantic equivalent is available.
- Each component folder has an `index.ts` barrel. Import across folders through
  the barrel (`import { FormInput } from '$lib/components/forms'`). **Exception:**
  a component importing a sibling in its own folder imports the file directly, to
  avoid the barrel importing itself (a cycle).
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
API label so every icon-only control has an accessible name. It exposes the same
approved variants as `AppButton`: `default` and `outline`.

## Styling & shadcn-svelte Rules

Presentational Tailwind belongs **inside** design-system and domain components,
not scattered through routes. Follow the shadcn-svelte skill's always-enforced
rules (see `.claude/skills/shadcn-svelte/rules/`):

- **Semantic tokens only** — `bg-background`, `text-muted-foreground`. Never raw
  palette/hex colors (`bg-blue-500`, `#fff`). Add a token in `lib/design` first.
- **`class` is for layout, not styling** — don't override component colors or
  typography via `class`; use variants/tokens.
- **Spacing uses `gap`** — `flex flex-col gap-*`, never `space-y-*` / `space-x-*`.
- **`size-*`** when width == height; **`truncate`** shorthand.
- **`cn()`** for conditional/merged classes — never string interpolation or
  ternaries inside a `class` attribute.
- **Prefer shadcn components over native elements and custom markup** —
  `Checkbox`/`RadioGroup`/`Textarea`/`Select` over native inputs; `Badge`,
  `Alert`, `Separator`, `Skeleton`, `Spinner`, `InputGroup` over hand-rolled
  equivalents. Group form controls with `Field.Set` + `Field.Legend` +
  `Field.Group`.
- **Icons** import from `@lucide/svelte` (never the deprecated `lucide-svelte`);
  inside a button use `data-icon="inline-start|inline-end"` and no sizing class
  (the button sizes icons).

### z-index

The map (MapLibre) creates its own stacking context, so app chrome layered over
the map needs explicit high z-index values. These live as a documented scale in
`src/routes/layout.css` (`--z-map-sidebar`, `--z-map-overlay`, `--z-map-controls`)
— reference them with `z-[var(--z-map-overlay)]`. Do not hand-write arbitrary
z-index numbers; standard low utilities (`z-10`/`z-20`) are fine for purely local
stacking.

## Documentation

Storybook documents component examples and allowed variants. Add stories next to
the component they document, named `ComponentName.stories.svelte`, and tag public
design-system component stories with `autodocs`.
