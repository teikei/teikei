# Spec: Entry List Accessibility & Interaction Affordances (map-next)

## Problem Statement

The entry list in the map sidebar is the primary browsing surface of `packages/map-next`,
but its rows do not behave like the interactive, navigable things they are. Rows that
navigate to real deep-linkable URLs are rendered as `<button>`, so they cannot be opened in
a new tab, copied, or announced as links. Tailwind v4 removed the preflight `cursor: pointer`
reset for buttons and no component re-added it, so every button in the application —
including these rows — shows an arrow cursor and reads as inert text.

The visual state tokens were tuned against a white panel, but the sidebar is cream
(`--sidebar` = `--base-color-cream-100`). The hover fill (`--sidebar-accent`) measures
**1.035:1** against it and is imperceptible; the map→list highlight uses a second,
differently-shaped mechanism resolving to the same invisible value, so the marker↔row
correspondence the feature was built for never actually shows. The focus ring
(`--sidebar-ring` = olive-400) measures **2.04:1**, below the 3:1 that WCAG 2.2 SC 1.4.11
requires — and since the rows set `outline-hidden`, it is the only focus indicator.

Assistive-technology users get a further degraded view: loading skeletons are announced as
five empty list items, the list has no accessible name (the visible "250 Einträge" count is
an unassociated `<div>`), and the count silently rewrites itself on every map pan with no
live region to announce it.

## Features

1. **Entry rows as links**
   - Description: Rows in the public (all-entries) list navigate to real hash URLs, so they
     become `<a href>`. Rows in the my-entries list only pan the map and stay `<button>`.
     Also fixes invalid list markup in the my-entries list.
   - Acceptance criteria:
     - In the public list (`EntriesList.svelte`), each `entry-row` for a Farm or Initiative
       is an `<a>` whose `href` equals `routeBuilders.mainEntryDetail(...)` for that entry.
     - Depot rows are an `<a>` with `href` = `routeBuilders.depotLegacy.detail(id)` — a
       working URL that redirects to the associated farm (see
       `e2e/legacy-routes.test.ts:105`).
     - ⌘/Ctrl-click and middle-click open that URL in a new tab and leave the current list
       untouched; the click handler must not `preventDefault` on modified clicks.
     - A plain click still pans the map and navigates in place exactly as today: all
       existing e2e tests touching the list pass unchanged.
     - My-entries rows (`MyEntriesList.svelte`) remain `<button>` with no `href` — clicking
       one only pans the map (`MapSidebar.svelte` `handleEntryClick` returns early for the
       my-entries scope), so there is no destination to link to.
     - Row visuals are pixel-identical before and after (no underline, no link color).
     - In `MyEntriesList.svelte`, the farm-group wrapper currently rendered as a `<div>`
       child of `<ul>` (`data-testid="my-entries-farm-group"`) no longer produces a
       non-`<li>` child of a `<ul>`; the rendered list validates as well-formed list markup
       and screen readers report the correct item count.

2. **Application-wide pointer cursor on buttons and links**
   - Description: Restore `cursor: pointer` for enabled buttons and links with a single
     global rule, without modifying any vendored primitive. The governing rule is **match
     the native equivalent**: native `<button>` and `<a href>` show a pointer, so custom
     ones do too; native `<select>`, `<input type=checkbox>` and `<input type=radio>` show
     an arrow, so their emulations keep one.
   - Acceptance criteria:
     - A single `@layer base` rule is added to `src/routes/layout.css`:
       ```css
       @layer base {
         button:not(
           :disabled,
           [aria-disabled='true'],
           [data-slot='select-trigger'],
           [data-slot='checkbox'],
           [data-slot='radio-group-item']
         ),
         [role='button']:not([aria-disabled='true']),
         a[href] {
           cursor: pointer;
         }
       }
       ```
     - No file under `src/lib/components/ui/` is modified by this feature.
     - Hovering any enabled button or link in the app computes `cursor: pointer` — including
       the entry rows, `AppButton`/`IconButton`, accordion triggers, dropdown-menu triggers,
       and the hand-rolled buttons in `forms/GeocoderField.svelte`,
       `forms/MultiSelectCombobox.svelte`, `domain/farms/sections/FarmDepotsSection.svelte`.
     - These compute a non-pointer cursor: dropdown-menu / select / command items
       (`cursor-default`), checkboxes, radio items, select triggers, the bottom-sheet drag
       handle (`grab` / `grabbing`), and the sidebar rail (resize cursors).
     - Exception, opted in at the call site: the two region-filter `Select.Trigger`s in
       `domain/map/RegionFilters.svelte:37,59` gain `cursor-pointer` in their existing
       inline `class`. They are shell chrome deliberately styled to match the nav buttons
       (DESIGN.md "Control Hierarchy"), so an arrow there would read as a defect.
     - A disabled or `aria-disabled` control does not show a pointer cursor.
     - The redundant hand-written `cursor: pointer` rules in
       `domain/map/EntryMarkerButton.svelte` and `widgets/search-widget/search-widget.svelte`
       may be left in place; they are harmless and out of the sidebar's scope.

3. **Hover fill retuned for the cream panel**
   - Description: `--sidebar-accent` is consumed only by `ui/sidebar/*`, and
     `Sidebar.MenuButton` is used only by the two entry lists (`isActive`, `MenuAction`,
     `GroupAction` and `MenuSubButton` have no consumers in the app), so retuning the token
     fixes the hover with a blast radius of exactly the entry rows. No new semantic token
     and no primitive edit are needed.
   - Acceptance criteria:
     - New base color `--base-color-cream-200: oklch(0.88 0.008 170.4)` in
       `src/lib/design/theme-vars.css` — same hue family as `--base-color-cream-100`.
     - `teikei`'s `--sidebar-accent` becomes `--base-color-cream-200`: measured **1.254:1**
       against `--sidebar`.
     - `client-demo`'s `--sidebar-accent` becomes the existing `--base-color-mist-200`:
       measured **1.214:1** against `--sidebar` (`--base-color-mist-50`).
     - `--sidebar-accent` measures between 1.15:1 and 1.30:1 against `--sidebar` in every
       theme.
     - `--sidebar-accent-foreground` is unchanged and stays ≥4.5:1 on the new fill
       (olive-900 on cream-200 ≈ 12.2:1; ink-900 on mist-200 ≈ 14.0:1).
     - Hovering an entry row produces a visibly different row background.
     - `DESIGN.md` gains a subsection next to "Control Hierarchy (border contrast)"
       documenting that `--sidebar-accent` is tuned against the cream `--sidebar` (not
       white), its measured ratios, and the ≥1.15:1 floor for row emphasis.

4. **Map-hover and pointer-hover paint the same row emphasis**
   - Description: Pointer hover and map-marker hover currently paint different elements with
     different radii, and the map path resolves to an invisible `bg-muted`. Point both at
     the same element and the same fill.
   - Acceptance criteria:
     - The entry row in `EntriesList.svelte` gains `data-highlighted` (set when
       `hoveredEntry.key` matches the row's `entryHoverKey`, regardless of
       `hoveredEntry.source`) and `data-highlighted:bg-sidebar-accent` in its `class` prop.
     - `EntryCard.svelte`'s `highlighted` prop, its `bg-muted` class and its internal
       `data-highlighted` attribute are removed; `EntryCard.stories.svelte:52` is updated
       to stop passing `highlighted`.
     - Hovering a map marker and hovering the corresponding list row produce a visually
       identical row treatment, filling the full row rather than the inset card.
     - The primitive's own `hover:bg-sidebar-accent` in
       `ui/sidebar/sidebar-menu-button.svelte` is left untouched — the pointer path keeps
       using `:hover` and the map path uses `data-highlighted`, both painting the same fill
       on the same element.

5. **Focus ring meets 3:1**
   - Description: Raise the sidebar focus-ring token to the same altitude as
     `--control-border`. The rows set `outline-hidden`, so this ring is the only focus
     indicator they have.
   - Acceptance criteria:
     - `teikei`'s `--sidebar-ring` becomes `--base-color-olive-600`: measured **3.734:1**
       against `--sidebar` and **4.260:1** against `--card`.
     - `client-demo`'s `--sidebar-ring` is unchanged (brand-700, 7.782:1).
     - `--sidebar-ring` measures ≥3:1 against both `--sidebar` and `--card` in every theme.
     - Tabbing to an entry row shows a clearly visible ring against the cream panel.

6. **Keyboard focus drives the map highlight (public list only)**
   - Description: The list↔map hover coupling is mouse-only today
     (`onmouseenter`/`onmouseleave`). Give keyboard users the same feedback in the public
     list.
   - Acceptance criteria:
     - Focusing a row in `EntriesList.svelte` calls `hoveredEntry.setHover(props, 'list')`;
       blurring calls `hoveredEntry.clear(props)`.
     - Tabbing through the list emphasizes the corresponding marker and does not make the
       list scroll itself — the scroll-into-view effect stays guarded to `source === 'map'`.
     - `MyEntriesList.svelte` gains no hover or focus coupling. This is deliberate: it has
       none today and none is wanted.

7. **Loading skeletons hidden from assistive technology**
   - Description: Skeleton placeholders are currently real `<li>`s with no text, so a screen
     reader announces five empty list items.
   - Acceptance criteria:
     - Skeleton `<li>`s in both `EntriesList.svelte` and `MyEntriesList.svelte` carry
       `aria-hidden="true"` (passed through `Sidebar.MenuItem`'s `restProps`).
     - While loading, the accessibility tree exposes no empty list items.
     - The `aria-busy` attribute on the `<ul>` is retained as the loading signal.

8. **The list has an accessible name**
   - Description: The visible entry count is an unassociated `<div>`, so the `<ul>` has no
     accessible name.
   - Acceptance criteria:
     - The `Sidebar.GroupLabel` in both lists gets a stable id via Svelte 5's `$props.id()`
       (passed through `restProps`).
     - The `<ul>` (`Sidebar.Menu`) references it via `aria-labelledby`.
     - The `<ul>`'s computed accessible name equals the visible label text, in both the
       capped ("250 Einträge · 200 angezeigt") and uncapped variants.

9. **The changing entry count is announced**
   - Description: Panning or zooming the map rewrites the list and its count with no
     announcement. Make the visible count a polite live region, debounced so a continuous
     pan announces once on settle instead of streaming every intermediate value.
   - Acceptance criteria:
     - The count element in `EntriesList.svelte` carries `aria-live="polite"`.
     - The capped and uncapped variants render as one element whose text changes, not two
       elements swapped by `{#if}` — swapping the node breaks live-region announcement.
     - The count text is debounced via the existing `createDebouncedCallback` from
       `$lib/utils/debounce` (500ms). Because the live region _is_ the visible element, the
       displayed number is debounced too: during a pan it holds the previous value and
       settles ~500ms after the map stops. This is an accepted, intentional behavior change
       — it also removes the current per-frame flicker.
     - A continuous pan produces one announcement, not one per viewport update.
     - `MyEntriesList.svelte`'s count gets no live region; it does not change with map
       movement.

## Technical Solution

- **Architecture:** All changes live in `packages/map-next`. Token changes go in
  `src/lib/design/theme-vars.css` for both the `teikei` and `client-demo` themes, with the
  rationale documented in `src/lib/design/DESIGN.md`. The cursor rule goes in
  `src/routes/layout.css`, which already carries project-level CSS (the z-index scale, the
  `@theme` token mappings). Row semantics and ARIA changes are local to
  `src/lib/components/domain/entries/{EntriesList,MyEntriesList,EntryCard}.svelte`, plus one
  inline class in `src/lib/components/domain/map/RegionFilters.svelte`.
- **Technologies:** Svelte 5 (runes), SvelteKit hash routing, Tailwind CSS v4,
  shadcn-svelte / bits-ui primitives, Playwright for e2e.
- **Key decisions:**
  - **No file under `src/lib/components/ui/` is modified.** DESIGN.md:144 documents the
    vendored shadcn-svelte primitives as off-limits ("do not 'fix' them"). Every change here
    reaches its target through a supported seam instead: theme tokens, a global CSS layer,
    the `child` snippet, or `restProps` pass-through.
  - Rows become links via `Sidebar.MenuButton`'s existing `child` snippet, which renders an
    arbitrary element with the merged button props — no new primitive, no style drift.
  - Depot rows link to `#/depots/:id` rather than pre-resolving the owning farm, because
    that URL already exists and redirects; the click handler keeps its faster direct path.
  - The cursor rule needs no exclusions for components that already set a `cursor-*` utility
    (menu/select/command items, the bottom-sheet handle, the sidebar rail): Tailwind v4
    orders cascade layers `theme, base, components, utilities`, so a utility class always
    beats an `@layer base` rule regardless of specificity. Components with no cursor utility
    that must stay on an arrow are excluded by `data-slot`, which every shadcn primitive
    carries.
  - `--sidebar-accent` is retuned in place rather than shadowed by a new `--sidebar-hover`
    token. A new token was considered to limit collateral damage, but there is none to
    limit: the token's only consumers are `ui/sidebar/*`, whose only consumers are the two
    entry lists.
  - `data-highlighted` (the bits-ui idiom, already used by `select-item`) is reused on the
    row; there is no selector collision since the components are disjoint.

## Out of Scope

- Modifying any vendored primitive under `src/lib/components/ui/`.
- `--ring` (the form-control focus token). Form controls pair a low-opacity ring with a
  border change — a different mechanism from the sidebar row's ring-only indicator, and it
  does not fail 3:1 the same way.
- Pointer cursors on menu/select/command items, checkboxes, radios, and select triggers
  (except the two region filters, which opt in at the call site).
- Adding hover or focus map coupling to `MyEntriesList`.
- The verbose concatenated accessible name of a row ("Hof · Name · Mitgliedschaft · PLZ Ort
  · Produkte"). It is long but informative; left as is.
- Any change to `packages/map` (legacy, being retired).
- An end-of-list marker for the capped 200-row list.

## Additional Notes

- Contrast figures were computed from the oklch token values via oklch → linear sRGB → WCAG
  relative luminance. Both `teikei` and `client-demo` are light themes; there is no dark
  theme to verify.
- The app has no `aria-live` region today, so Feature 9 establishes the pattern for the
  codebase.
- Feature 2's rule depends on Tailwind v4's utilities-after-base layer order. A future
  component that wants a non-pointer cursor should set a `cursor-*` utility (or carry a
  `data-slot` added to the exclusion list) rather than try to out-specify the base rule.
- `e2e/perf-accessibility-sanity.test.ts` is the natural home for regression coverage of
  Features 1, 7, 8, and 9.
- `README.md:57` describes shadcn components as living in `src/lib/components/shadcn/`; the
  actual directory is `src/lib/components/ui/`. Stale doc, unrelated to this work, but worth
  correcting opportunistically.
