# Spec: Depot handling improvements in map-next

## Problem Statement

In `packages/map-next`, users can connect a depot (Abholstelle) to any farm, including farms they don't own. This is a genuinely-used feature we must keep — but the current UI treats owned and foreign farms identically, which quietly encourages users to attach depots to farms that aren't theirs. The default, expected workflow is: create a depot and connect it to a farm you own. Connecting to a foreign farm should remain possible but become a deliberate, opt-in action.

Separately, the depot list inside a farm profile shows only name + place, hides useful depot info (description, website, delivery days), has a confusing double-layer of expand/collapse behavior, and — unlike farm/initiative list items — doesn't highlight its map marker on hover. The "Wird von einem anderen Konto verwaltet." hint is also shown in contexts where it carries no value.

Audience: signed-in Ernte-teilen users who manage farms and depots.

## Features

### 1. Owned-farms-first farm selector with opt-in foreign connection

- Description: In the depot create/edit form (`DepotEditor.svelte`), the primary farm selector shows only farms the current user owns. A checkbox (e.g. "Auch fremde Höfe verbinden") is required to expand the selector to include all farms, making foreign-farm connection a deliberate step. The preset-farm create flow (from a farm profile) is unchanged.
- Acceptance criteria:
  - In create mode with no preset farm, the farm combobox lists only the user's owned farms by default.
  - A checkbox toggles the combobox to list all farms; when unchecked, the combobox is restricted to owned farms.
  - Foreign farms cannot be selected while the checkbox is unchecked.
  - The preset-farm create flow (fixed, read-only farm) is unchanged.
  - Helper text near the control communicates that connecting your own farm is the expected default.

### 2. Consistent owned-farm restriction + foreign chips in edit mode

- Description: Fix the current inconsistency where edit mode exposes all farms regardless of ownership. Edit mode applies the same owned-farms-default + checkbox rule as create. When a depot is already connected to one or more foreign farms, those show as removable chips and the foreign-farm checkbox is auto-enabled on load.
- Acceptance criteria:
  - Editing a depot with only owned-farm connections shows the checkbox unchecked and the combobox restricted to owned farms.
  - Editing a depot that already has ≥1 foreign-farm connection loads with the checkbox pre-enabled and the foreign farm(s) shown as removable chips.
  - The user can remove a foreign-farm chip and save.
  - The `farmOptions` supplied to edit mode is corrected so owned/foreign farms are distinguishable (edit route currently loads all farms via `getEntries` with no ownership split).

### 3. Farm-owner-scoped "managed by another account" notice

- Description: The "Wird von einem anderen Konto verwaltet." hint on a depot card (`FarmDepotsSection.svelte`) is shown only when the viewer owns the farm being viewed but not the depot — the only context where the message is informative. It is not shown when viewing a farm the user doesn't own.
- Acceptance criteria:
  - Viewing a farm you own: depot cards for depots you don't own show the notice; depots you own show edit/delete instead.
  - Viewing a farm you don't own: no depot card shows the notice.

### 4. "Add depot" button restricted to owned farms (verify)

- Description: The "Abholstelle hinzufügen" button already only renders on farms the user owns (`isFarmOwner={canEdit}`). This feature confirms/locks that behavior with test coverage; no behavior change expected unless a gap is found.
- Acceptance criteria:
  - The add-depot button is present on the profile of an owned farm and absent on a foreign farm's profile.

### 5. Expanded depot info via per-depot accordion

- Description: Each depot in the farm profile's depot list becomes a collapsed-by-default accordion row that expands to show description, website (as a link), and delivery days when present. The existing list-level ">5 show all / show less" collapse is removed — all depots always render — to avoid two competing expand/collapse controls.
- Acceptance criteria:
  - All depots connected to the farm render (no list-level truncation/collapse).
  - Each depot row expands to reveal description, website, and delivery days; fields that are empty/null are omitted.
  - Website renders as a clickable link.
  - Owned-depot edit/delete affordances and the foreign notice (Feature 3) remain accessible on each row.
  - Accordion rows are collapsed by default and independently expandable.

### 6. Depot list hover highlights the map

- Description: Hovering a depot row in the farm profile highlights that depot on the map, matching the existing farm/initiative list↔marker hover coupling. Highlight fires on both the standalone depot circle marker and the network connection line/ring to the open farm.
- Acceptance criteria:
  - Hovering a depot row highlights that depot's map marker (base circle marker).
  - The network connection line/ring from the open farm to that depot is emphasized on hover.
  - Highlight clears on mouse-out; behavior is keyed per depot (`type:id`) so only the hovered depot highlights.
  - Reuse the existing `hoveredEntry` store mechanism.

## Technical Solution

- **Architecture:** All changes are contained in `packages/map-next`. No API or data-model changes — depot entities already carry `description`, `url`, `deliveryDays`, and reciprocal `farms`/`depots` collections.
- **Farm selector (F1/F2):** Extend `DepotEditorData`/`DepotFarmOption` so the editor knows which farm options are owned vs. all. Load routes (`routes/depots/new/+page.ts`, `routes/depots/[id]/edit/+page.ts`) supply owned farms (`getMyEntries`) and the full set (`getEntries`); the editor filters the combobox by the checkbox state. Auto-enable checkbox in edit when any currently-connected farm is not in the owned set.
- **Notice scoping (F3):** `FarmDepotsSection.svelte` already receives `isFarmOwner`; gate the `details_depot_owned_by_other` branch on `isFarmOwner && !isOwned`.
- **Depot accordion (F5):** Add a thin `ui/accordion` (or `ui/collapsible`) wrapper over the already-present `bits-ui` primitive, matching existing UI-wrapper conventions. Replace the `DEPOT_COLLAPSE_LIMIT`/`expanded` list-level toggle in `FarmDepotsSection.svelte` with per-row accordions. New message keys for any added labels.
- **Hover coupling (F6):** Add `onmouseenter`/`onmouseleave` on depot rows calling `hoveredEntry.setHover(depot.properties, 'list')`/`clear`. On the map side, `NetworkLayer.svelte` gains a `hovered` property (driven by `hoveredEntry.key`) mirroring the existing `selected` emphasis on its line/highlight layers; the base depot circle layer (`secondary-points` in `Map.svelte`) is highlighted via a MapLibre expression/feature-state matching the hovered depot id. Reuse the `entryHoverKey` `type:id` scheme.
- **Key decisions:** Checkbox (opt-in) chosen over farm-grouping so foreign connection is a conscious action and consistent with the auto-enable-on-existing-foreign-connection behavior. Per-depot accordion + always-render-all chosen over nested collapses to eliminate competing disclosure controls.

## Out of Scope

- Backend/API changes to depot or farm models, ownership fields, or endpoints.
- Changes to `packages/map` (legacy map, being retired).
- Preventing foreign-farm connections outright — the capability is retained by design.
- Reworking the map's depot marker rendering pipeline beyond adding hover highlight.
- Depot deletion/creation flows themselves (beyond the farm-selector control).

## Additional Notes

- The base-map depot markers are a clustered `CircleLayer` (`secondary-points`), not per-element `SymbolMarkerLayer` markers, so single-depot hover highlighting there needs a data-driven paint expression or feature-state rather than the per-marker CSS class approach used for farms/initiatives. Flagged as the main implementation risk for F6.
- The exact German label/help-text wording for the foreign-farm checkbox (F1) and the accordion expand affordance (F5) is TBD — implementer to add message keys; final copy can be adjusted.
- Assumption: "owned" is derived from `getMyEntries()` (`?mine=true`), consistent with existing `ownedDepotIds`/`ownedFarmIds` logic in `MapSidebar.svelte`.
