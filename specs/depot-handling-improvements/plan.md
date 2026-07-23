# Implementation Plan: Depot handling improvements in map-next

Spec: specs/depot-handling-improvements/spec.md

Status legend: [ ] todo · [~] in progress · [x] done

Model recommendation legend (implementation agent): each feature is tagged with a
suggested model — **fable** (fast, mechanical), **sonnet** (moderate feature work),
**opus** (hardest reasoning / map internals).

- [x] 1. Owned-farms-first farm selector with opt-in foreign connection (depends on: none) — model: sonnet
  - [x] 1.1 Extend `DepotEditorData`/`DepotFarmOption` (`src/lib/types/editor.ts`) so the editor receives owned-farm options separately from all-farm options (e.g. `farmOptions` = owned, plus `allFarmOptions`, or an `owned` flag per option).
  - [x] 1.2 Update the create loader (`src/routes/depots/new/+page.ts`) to supply both owned farms (`getMyEntries`) and the full farm set (`getEntries`) via the extended editor data; keep preset-farm flow unchanged.
  - [x] 1.3 In `DepotEditor.svelte`, add a "connect foreign farms" checkbox (new message key) that switches the `MultiSelectCombobox` option source between owned-only and all farms; default unchecked. Hide/skip when `isPresetFarm`.
  - [x] 1.4 Ensure foreign farms are not selectable while unchecked (filter options), and add helper text (new message key) stating the expected default is your own farm.
  - [x] 1.5 Add/extend Playwright (or component) coverage: create form defaults to owned-only options; checkbox reveals all farms.

- [ ] 2. Consistent owned-farm restriction + foreign chips in edit mode (depends on: 1) — model: sonnet
  - [ ] 2.1 Update the edit loader (`src/routes/depots/[id]/edit/+page.ts`) to supply owned vs. all farm options (mirror 1.1/1.2), replacing the current all-farms-only `getEntries` behavior.
  - [ ] 2.2 In `DepotEditor.svelte`, on edit-mode init, auto-enable the foreign-farm checkbox when any currently-connected farm is not in the owned set.
  - [ ] 2.3 Render already-connected foreign farms as removable chips (the combobox already renders selected values as removable); confirm removal + save works even when the foreign checkbox is toggled off.
  - [ ] 2.4 Add coverage: editing an owned-only depot → checkbox unchecked, owned-only options; editing a depot with a foreign connection → checkbox pre-enabled, foreign farm shown as removable chip, removal persists on save.

- [x] 3. Farm-owner-scoped "managed by another account" notice (depends on: none) — model: fable
  - [x] 3.1 In `FarmDepotsSection.svelte`, gate the `details_depot_owned_by_other` branch on `isFarmOwner && !isOwned` (currently shows on any non-owned depot regardless of farm ownership).
  - [x] 3.2 Add coverage: notice appears on a foreign depot when viewing an owned farm; notice absent for every depot when viewing a foreign farm.

- [ ] 4. "Add depot" button restricted to owned farms (verify) (depends on: none) — model: fable
  - [ ] 4.1 Verify `farm-add-depot` renders only when `isFarmOwner` in `FarmDepotsSection.svelte` / its wiring in `FarmProfile.svelte` + `MapSidebar.svelte`; fix if a gap is found.
  - [ ] 4.2 Add/confirm coverage: add-depot button present on an owned farm profile, absent on a foreign farm profile.

- [ ] 5. Expanded depot info via per-depot accordion (depends on: 3) — model: sonnet
  - [ ] 5.1 Add a thin `src/lib/components/ui/accordion` (or `collapsible`) wrapper over the existing `bits-ui` primitive, matching the conventions of sibling `ui/` wrappers.
  - [ ] 5.2 In `FarmDepotsSection.svelte`, remove the list-level `DEPOT_COLLAPSE_LIMIT`/`expanded`/`visibleDepots` toggle so all depots always render; delete the `farm-depots-toggle` control and its message usage.
  - [ ] 5.3 Convert each depot card into a collapsed-by-default accordion row exposing `description`, `url` (as a clickable link), and `deliveryDays`, omitting empty/null fields; keep name + place in the header.
  - [ ] 5.4 Preserve owned-depot edit/delete affordances and the Feature 3 foreign notice within/alongside each accordion row; add message keys for any new labels.
  - [ ] 5.5 Add coverage: all depots render (no truncation), a row expands to reveal description/website/delivery days, empty fields are omitted, edit/delete + notice still reachable.

- [ ] 6. Depot list hover highlights the map (depends on: 5) — model: opus
  - [ ] 6.1 In `FarmDepotsSection.svelte`, add `onmouseenter`/`onmouseleave` on each depot row calling `hoveredEntry.setHover(depot.properties, 'list')` / `hoveredEntry.clear(depot.properties)`.
  - [ ] 6.2 In `NetworkLayer.svelte`, add a `hovered` flag (driven by `hoveredEntry.key` via `entryHoverKey`) per depot and mirror the existing `selected` emphasis on the line + highlight-ring paint expressions.
  - [ ] 6.3 In `Map.svelte`, highlight the hovered depot on the `secondary-points` clustered `CircleLayer` via a data-driven paint expression / feature-state keyed on the hovered depot id (the main implementation risk noted in the spec).
  - [ ] 6.4 Confirm bidirectional/clear behavior: highlight is keyed per depot (`type:id`), fires on both marker and network line/ring, and clears on mouse-out.
  - [ ] 6.5 Add coverage: hovering a depot row highlights the corresponding depot marker + network connection; only the hovered depot is highlighted; clears on leave.
