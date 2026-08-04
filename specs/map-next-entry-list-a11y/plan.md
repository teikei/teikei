# Implementation Plan: Entry List Accessibility & Interaction Affordances (map-next)

Spec: specs/map-next-entry-list-a11y/spec.md

Status legend: [ ] todo · [~] in progress · [x] done

All paths are relative to `packages/map-next/`. Hard constraint across every feature: no file
under `src/lib/components/ui/` is modified.

- [ ] 1. Entry rows as links (depends on: none)
  - [ ] 1.1 Confirm `routeBuilders.entryDetail(entryType, id)` in `src/lib/utils/routes.ts`
        returns the correct URL for all three row types (Farm → `#/farms/:id`, Initiative →
        `#/initiatives/:id`, Depot → `#/depots/:id`); add unit coverage if absent.
  - [ ] 1.2 In `src/lib/components/domain/entries/EntriesList.svelte`, render the row through
        `Sidebar.MenuButton`'s `child` snippet as `<a href={routeBuilders.entryDetail(...)}>`,
        spreading the snippet's merged props so classes, `data-testid="entry-row"` and
        `data-entry-key` are unchanged.
  - [ ] 1.3 Guard the row click handler so it only `preventDefault`s plain primary clicks —
        let ⌘/Ctrl/Shift/Alt-click, middle-click and context-menu fall through to the browser.
        Plain clicks keep calling `handleEntryClick` (map pan + `goto`) exactly as today.
  - [ ] 1.4 In `src/lib/components/domain/entries/MyEntriesList.svelte`, restructure the farm
        group so `data-testid="my-entries-farm-group"` no longer renders a `<div>` as a direct
        child of the `<ul>`; keep the existing test id and `data-own-farm` attribute on
        whatever element replaces it.
  - [ ] 1.5 Confirm my-entries rows are still `<button>` with no `href` (they only pan the map).
  - [ ] 1.6 Verify row visuals are unchanged (no underline, no link color) and the existing
        e2e suites touching the list still pass; add e2e coverage for the `href` value and for
        ⌘/middle-click opening a new tab without disturbing the current list.

- [ ] 2. Application-wide pointer cursor on buttons and links (depends on: none)
  - [ ] 2.1 Add the `@layer base` cursor rule from the spec to `src/routes/layout.css`,
        excluding `:disabled`, `[aria-disabled='true']`, and the `select-trigger` / `checkbox` /
        `radio-group-item` data-slots.
  - [ ] 2.2 Add `cursor-pointer` to the existing inline `class` on both region-filter
        `Select.Trigger`s in `src/lib/components/domain/map/RegionFilters.svelte:37,59`.
  - [ ] 2.3 Verify pointer appears on: entry rows, `AppButton`/`IconButton`, accordion
        triggers, dropdown-menu triggers, and the hand-rolled buttons in `GeocoderField`,
        `MultiSelectCombobox`, `FarmDepotsSection`.
  - [ ] 2.4 Verify a non-pointer cursor remains on: dropdown-menu / select / command items,
        checkboxes, radio items, non-region-filter select triggers, the bottom-sheet drag
        handle (`grab`/`grabbing`), the sidebar rail (resize), and disabled controls.
  - [ ] 2.5 Confirm `git diff` shows no change under `src/lib/components/ui/`.

- [ ] 3. Hover fill retuned for the cream panel (depends on: none)
  - [ ] 3.1 Add `--base-color-cream-200: oklch(0.88 0.008 170.4)` to `src/lib/design/theme-vars.css`.
  - [ ] 3.2 Repoint the `teikei` theme's `--sidebar-accent` from `--base-color-olive-100` to
        `--base-color-cream-200`.
  - [ ] 3.3 Repoint the `client-demo` theme's `--sidebar-accent` from `--base-color-mist-100`
        to the existing `--base-color-mist-200`.
  - [ ] 3.4 Verify measured contrast: `--sidebar-accent` vs `--sidebar` lands in 1.15:1–1.30:1
        in both themes (expected 1.254:1 teikei, 1.214:1 client-demo), and
        `--sidebar-accent-foreground` on the new fill stays ≥4.5:1.
  - [ ] 3.5 Confirm by eye that hovering an entry row now produces a visibly different row
        background in both themes.
  - [ ] 3.6 Document the retune in `src/lib/design/DESIGN.md` beside "Control Hierarchy
        (border contrast)": that `--sidebar-accent` is tuned against the cream `--sidebar`
        rather than white, its measured ratios, and the ≥1.15:1 floor for row emphasis.

- [ ] 4. Map-hover and pointer-hover paint the same row emphasis (depends on: 1, 3)
  - [ ] 4.1 In `EntriesList.svelte`, add `data-highlighted` to the row when
        `hoveredEntry.key === key` regardless of `hoveredEntry.source`, plus
        `data-highlighted:bg-sidebar-accent` in its `class`.
  - [ ] 4.2 Remove the `highlighted` prop, the `bg-muted` class and the internal
        `data-highlighted` attribute from `src/lib/components/domain/entries/EntryCard.svelte`.
  - [ ] 4.3 Drop the `highlighted` prop from `EntryCard.stories.svelte:52`.
  - [ ] 4.4 Verify hovering a map marker and hovering the corresponding row produce an
        identical full-row fill (not the inset card), and that the list still auto-scrolls the
        matching row into view for map-sourced hovers only.

- [ ] 5. Focus ring meets 3:1 (depends on: none)
  - [ ] 5.1 Repoint the `teikei` theme's `--sidebar-ring` from `--base-color-olive-400` to
        `--base-color-olive-600` in `src/lib/design/theme-vars.css`; leave `client-demo`
        (brand-700) alone.
  - [ ] 5.2 Verify `--sidebar-ring` measures ≥3:1 against both `--sidebar` and `--card` in
        every theme (expected 3.734:1 and 4.260:1 for teikei).
  - [ ] 5.3 Tab to an entry row and confirm the ring is clearly visible against the cream panel.

- [ ] 6. Keyboard focus drives the map highlight (public list only) (depends on: 1)
  - [ ] 6.1 Add `onfocus` → `hoveredEntry.setHover(props, 'list')` and `onblur` →
        `hoveredEntry.clear(props)` to the row in `EntriesList.svelte`, alongside the existing
        mouse handlers.
  - [ ] 6.2 Verify tabbing through the list emphasizes the matching map marker, blurring
        clears it, and the list does not scroll itself (the scroll-into-view effect must stay
        guarded to `source === 'map'`).
  - [ ] 6.3 Confirm `MyEntriesList.svelte` is untouched — no hover or focus coupling added.

- [ ] 7. Loading skeletons hidden from assistive technology (depends on: none)
  - [ ] 7.1 Add `aria-hidden="true"` to the skeleton `Sidebar.MenuItem`s in
        `EntriesList.svelte` (passed through `restProps`).
  - [ ] 7.2 Same for the skeleton `Sidebar.MenuItem`s in `MyEntriesList.svelte`.
  - [ ] 7.3 Verify the accessibility tree exposes no empty list items while loading, and that
        `aria-busy` on the `<ul>` is retained; add e2e coverage in
        `e2e/perf-accessibility-sanity.test.ts`.

- [x] 8. The list has an accessible name (depends on: none)
  - [x] 8.1 In `EntriesList.svelte`, generate a stable id with Svelte 5 `$props.id()`, pass it
        to `Sidebar.GroupLabel`, and reference it from `Sidebar.Menu` via `aria-labelledby`.
  - [x] 8.2 Do the same in `MyEntriesList.svelte` — note it renders two separate
        `Sidebar.Menu` instances (skeleton and populated); both need the `aria-labelledby`.
  - [x] 8.3 Verify the `<ul>`'s computed accessible name equals the visible label text in both
        the capped ("250 Einträge · 200 angezeigt") and uncapped variants; add e2e coverage in
        `e2e/perf-accessibility-sanity.test.ts`.

- [ ] 9. The changing entry count is announced (depends on: 8)
  - [ ] 9.1 In `EntriesList.svelte`, collapse the `{#if hasCappedEntries}` / `{:else}` pair
        into a single element whose text is computed, so the live region's node is never
        swapped.
  - [ ] 9.2 Debounce that element's text by 500ms using `createDebouncedCallback` from
        `$lib/utils/debounce`. The displayed number is debounced too — during a pan it holds
        the previous value and settles ~500ms after the map stops. This is intentional.
  - [ ] 9.3 Add `aria-live="polite"` to that element.
  - [ ] 9.4 Verify a continuous pan produces one announcement rather than one per viewport
        update, and that the element being both the `aria-labelledby` target from 8.1 and a
        live region does not cause a double announcement; if it does, move the live region to
        a sibling visually-hidden element and note the change in the spec.
  - [ ] 9.5 Confirm `MyEntriesList.svelte`'s count has no live region.
