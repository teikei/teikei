# Implementation Plan: map-next — Feature Parity, UX Concepts & Design Polish

Spec: specs/map-next-parity-ux/spec.md

Status legend: [ ] todo · [~] in progress · [x] done

- [x] 1. Geocoder address field in editors (depends on: none)
  - [x] 1.1 Build `forms/GeocoderField.svelte` (semantic layer, on `InputGroup`): 300 ms debounced autocomplete (min 2 chars) against `getAutocompleteSuggestions({ withEntries: false })` + `geocodeLocationId()` from `$lib/api/discovery.ts`; selection writes address/street/housenumber/city/state/country/postalcode/lat/lon into the bound form model; clearing the input clears all address fields; existing address renders as "address, city" and an untouched field keeps stored values. Add a Storybook story.
  - [x] 1.2 Build a map preview component: tiny non-interactive MapLibre instance at fixed zoom ~14 (≤ app max zoom 15), reusing `map-style.ts` tokens, showing the correct entry-type marker once coordinates exist.
  - [x] 1.3 Replace `AddressFields.svelte` usage in `EntryEditor.svelte` and `DepotEditor.svelte` with GeocoderField + preview; keep address fields in the superforms schema but render no inputs; add "enter and select an address" validation (typed-but-unselected text fails) with translated messages in all four locales + `validations.json`.
  - [x] 1.4 Tests: unit tests for the selection/clear/untouched model behavior; update editor e2e tests to drive the geocoder flow in farm, initiative, and depot editors.

- [x] 2. Farm and initiative deletion (depends on: 4)
  - [x] 2.1 Verify actual API delete behavior for a farm with depots against the new FK constraints in packages/api (cascade vs restrict vs detach, own vs foreign-owned depots); record the result in the spec's Additional Notes and fix API behavior if it violates the "never delete foreign-owned depots" rule.
  - [x] 2.2 Add farm/initiative `DELETE` functions to `$lib/api/entry-mutations.ts` (depot delete as reference).
  - [x] 2.3 Implement `handleDeleteEntry` in `MapSidebar.svelte` / `EntryRowActions.svelte`: `confirmDialog` naming the entry, depot-consequence copy per 2.1, success toast, my-entries store refresh, map entry removal without reload, navigate back to my-entries; translated strings in all locales.
  - [x] 2.4 e2e: delete farm with own depots (dialog states consequence, depots handled as stated), foreign-owned depot survives farm deletion, cancel performs no mutation.

- [x] 3. Editor validation and field parity (depends on: none)
  - [x] 3.1 Extend `editor-schema.ts` to legacy joi parity: `url` valid http(s) when present, maxlength 255 (name/city/street/…) and 1000 (description/participation/economicalBehavior/additionalProductInformation), `maximumMembers` non-negative integer, `foundedAtMonth` 1–12; add translated messages (`validations.json` via `translateErrors`) and extend `editor-schema.spec.ts`.
  - [x] 3.2 Add a visible required indicator to required fields (name, city, address via geocoder) in the form components.
  - [x] 3.3 Render badge logos (`badge.logo`, linked `badge.url`) next to editor badge checkboxes, reusing the `BadgesList` presentation.
  - [x] 3.4 Add the account-info box ("this entry is linked to <email>" + edit-account link) to every editor and the initiative editor intro text; i18n in all locales.

- [x] 4. Global toast feedback (sonner) (depends on: none)
  - [x] 4.1 Mount the vendored `ui/sonner` Toaster once in `+layout.svelte`; add `$lib/utils/toast.ts` with success/error helpers taking translated messages.
  - [x] 4.2 Wire auth flows: sign-in success (user's name), sign-out, sign-up confirmation-mail hint, activation/reactivation results in `AccountTokenHandler.svelte`.
  - [x] 4.3 Wire entry create/update success, contact-message sent, and unexpected API errors (destructive toast while inline field errors still render).
  - [x] 4.4 Replace `DepotMutationFeedback.svelte` and the `depotAction` query-param flow with toasts carrying a "show farm" action button; remove the banner component and update `depot-crud.test.ts`.

- [x] 5. Mobile bottom-sheet UX (depends on: none)
  - [x] 5.1 Add a snap-point bottom sheet (evaluate `vaul-svelte`) wrapped as a `layout/` component: drag handle, peek/half/full snap points, swipe between them; desktop keeps the current floating sidebar — MapSidebar content unchanged, only the container swaps per breakpoint.
  - [x] 5.2 Wire drawer states: list at peek/half with map pannable, detail opens at half and expands, editors/create-wizard open full-height with sticky save bar above the on-screen keyboard.
  - [x] 5.3 Mobile chrome audit: touch targets ≥44 px, search input above keyboard, safe-area insets, reposition map controls and user nav so nothing overlaps the sheet.
  - [x] 5.4 e2e: new snap-point interaction test on 390×844; keep existing responsive tests (`auth-overlay-responsive`, `responsive-shell-footer`) green.

- [x] 6. Farm↔depot network visualization on the map (depends on: none)
  - [x] 6.1 Build `domain/map/NetworkLayer.svelte`: GeoJSON LineString source computed from the open farm's + its depots' coordinates (from `page.data.detailData`); add line color/width map tokens to `theme-vars.css` for all registered themes.
  - [x] 6.2 Highlight the involved markers (state shared with `SymbolMarkerLayer`) and fit the viewport to the network bounds respecting the sidebar offset when the profile opens.
  - [x] 6.3 Depot selection (marker click, search result, deep link): render the owning farm's network with the selected depot emphasized; remove the layer on profile close; never render for initiatives or depot-less farms.
  - [x] 6.4 e2e covering draw-on-open/remove-on-close and depot-click highlighting; visual check in both theme families.

- [~] 7. Chrome parity odds and ends (depends on: none)
  - [x] 7.1 Show an external help link (config `externalHelpUrl`) in `UserNavigation.svelte` for signed-in and signed-out states, opening in a new tab; render nothing when unset.
  - [x] 7.2 Add onboarding intro texts to sign-in and sign-up, including the "this view requires sign-in" variant on redirect from a protected route; i18n in all locales.
  - [x] 7.3 Verify footer/attribution links against legacy (site, privacy, imprint, map data) — done; confirmed via `e2e/responsive-shell-footer.test.ts` that the OpenStreetMap credit already comes from MapLibre's default source attribution and the Mapbox-specific "Improve this map" link is deliberately excluded (this app uses MapLibre, not Mapbox), so no link additions were needed there. `search-widget` stub removal reverted per spec correction (see Additional Notes / PR proposal): the stub should stay until a real use case exists, not be deleted.

- [x] 8. Depots live on the farm profile (depends on: 4)
  - [x] 8.1 Replace the name-only depot list in `FarmDetail.svelte` with depot cards (name, address, delivery days); tapping a card pans/zooms the map to the depot and highlights its marker; edit/delete actions render only for depots the user owns, foreign-owned depots show an "owned by another account" hint.
  - [x] 8.2 Add "Add pickup location" on the owned farm profile: depot editor opens pre-associated (farm select hidden); create/edit/delete from the profile return to the farm profile with confirm dialog + toast.
  - [x] 8.3 Rework my-entries: depots always grouped under their farm (own depots under own farms; cross-owned depots under the foreign farm's name with the ownership hint); "New depot" shortcut offers only the user's own farms and points users with no farms to creating a farm first.
  - [x] 8.4 Route compat: `#/depots/:id` resolves to the owning farm's profile, `#/depots/new` opens the farm-selection-first flow, `#/depots/:id/edit` opens the depot editor; update `route-compat.ts` + tests.
  - [x] 8.5 e2e: create-from-profile flow, ownership-gated actions on the profile, my-entries grouping incl. the cross-owned legacy case.

- [ ] 9. Profile edit mode (inline editing, approximated) (depends on: 1, 2, 3, 4, 8)
  - [ ] 9.1 Introduce the section architecture: `domain/<type>/sections/` components exporting read + edit variants that share one layout wrapper; sections bind into a single `superForm` instance per profile; drawer decides read vs edit from route kind.
  - [ ] 9.2 Decompose the farm profile + `EntryEditor` into sections (header/identity incl. geocoder, description, products, economic behavior, membership, badges, depots — depots section keeps the read view's add/edit/delete affordances in edit mode, no inline depot fields).
  - [ ] 9.3 Decompose the initiative profile + editor into its sections the same way.
  - [ ] 9.4 Edit-mode shell: Edit action, sticky Save/Cancel bar with per-section error indicator, validation errors rendered inside the affected section, existing unsaved-changes guard; `#/farms/:id/edit` and `#/initiatives/:id/edit` open edit mode directly.
  - [ ] 9.5 Creation wizard (identity & location → details → membership/goals, type-specific) for `#/farms/new` / `#/initiatives/new`, landing on the new profile in edit mode.
  - [ ] 9.6 Remove the classic full-form farm/initiative editor routes/components (depot editor stays a classic compact form); update `inline-edit-create.test.ts`, `unsaved-changes-guard.test.ts`, and the rest of the e2e suite to green.

- [x] 10. Command-style search in the drawer (depends on: 5)
  - [x] 10.1 Add the shadcn `Command` (cmdk) primitive to `ui/` and rebuild the suggestion panel inline/anchored under the drawer-header input (overlaying the entry list): grouped sections (Locations/Farms/Depots/Initiatives) with type icons, listbox keyboard nav (arrows/Enter/Escape keeping the query), loading state, designed empty state.
  - [x] 10.2 Drawer-state rules: slim persistent header (back + search) while a detail view is open — selecting a result replaces the profile with map pan; no search rendered while an editor or the create wizard is open.
  - [x] 10.3 `/` and `⌘K` shortcuts scoped to the app root element (embed-safe — never capture keystrokes outside the embed host), expanding a collapsed drawer and focusing the search.
  - [x] 10.4 Mobile: focusing the search raises the sheet to full height with keyboard open; dismissing the keyboard returns to the previous snap point. Update `search-discovery.test.ts` + new shortcut/empty-state coverage.

- [x] 11. Entry list and card redesign (depends on: none)
  - [x] 11.1 Redesign `EntryCard.svelte`/`EntriesList.svelte`: type chip (Badge), name, address line, membership status (colored dot + label for farms), product category summary, divider-free layout with hover state; update stories.
  - [x] 11.2 List↔map hover coupling both ways: card hover highlights the marker; marker hover highlights the card and scrolls it into view (desktop).
  - [x] 11.3 Skeleton rows while entries load and a designed empty state with a "reset filters / zoom out" action.

- [ ] 12. Detail profile polish (depends on: 9, 10)
  - [ ] 12.1 Restructure the profile header: type icon/avatar, name, founded line, membership status chip consistent with card styling; action row (Contact as primary CTA in a sticky drawer footer, Edit for owners, share/copy-link).
  - [ ] 12.2 Content sections separated by `Separator` with consistent `typography/` use; products/goals as chip clusters grouped by category instead of `list-disc` bullets.
  - [ ] 12.3 Back affordance in the slim persistent drawer header (from 10.2) restoring the previous list scroll position and viewport, in addition to close.

- [ ] 13. Map visual language (depends on: none)
  - [ ] 13.1 Distinct marker hover and selected states in `SymbolMarkerLayer`: selected marker scales/changes color and stays highlighted while its profile is open; hover feedback beyond cursor change.
  - [ ] 13.2 Restyle cluster circles/count in `SymbolMarkerCluster` on the token palette.
  - [ ] 13.3 Restyle `Popup.svelte` on card tokens (background/foreground, radius scale, shadow) replacing the 0.8-opacity dark box; verify in both themes; keep the zoom indicator dev-gated.

- [ ] 14. App chrome & consistency pass (depends on: 5, 6, 10, 11, 12, 13)
  - [ ] 14.1 Decide and land the Track C token adjustments from `design-direction.md` (brand green `--primary`, cream panel background, coral cluster badge, serif-accent yes/no) in `theme-vars.css` + `DESIGN.md` + Storybook token stories; align all floating chrome (user nav pill, sidebar shell, map controls) on one radius/elevation scale.
  - [ ] 14.2 `Skeleton`/spinner for every async surface (detail load, my-entries) and designed error states for failed loads.
  - [ ] 14.3 Accessibility + spacing sweep: consistent focus-visible rings, focus trap and escape behavior in sheets/dialogs, spacing audited to the `gap-2/4/6` ladder.
  - [ ] 14.4 Verify all new components in `teikei` and client themes; `perf-accessibility-sanity.test.ts` passes.
