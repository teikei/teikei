# Spec: map-next — Feature Parity, UX Concepts & Design Polish

## Problem Statement

`packages/map-next` is the SvelteKit/shadcn rewrite of the legacy React app `packages/map`.
The rewrite is already substantial: map shell (MapLibre with clusters, symbol markers,
popups), viewport-synced entry list, search autocomplete (entries + locations), country/state
region filters, farm/initiative detail views, contact form with token feedback, complete auth
flows (sign-in/up, recover/reset password, edit account/password, confirmation + reactivation
tokens), my-entries scope, full-field editors for farms/initiatives/depots with unsaved-changes
guard, depot delete, legacy route compatibility, i18n (de-DE/de-AT/de-CH/fr-CH), themable
design tokens, embed + widget build targets, Storybook, and an e2e suite.

Three kinds of work remain before the legacy app can be retired:

1. **Parity gaps** — features the legacy app has that map-next lacks: the geocoder address
   control (editors currently expose nine plain text fields including raw lat/lon), farm and
   initiative deletion (only depot delete works; MapSidebar contains a "deferred beyond T12"
   stub), toast feedback (sonner is vendored but no Toaster is mounted and nothing uses it),
   validation depth (no URL/maxlength checks), and small chrome items (external help link,
   editor account-info box, badge logos in editor). The legacy embeddable network widget is
   deliberately dropped, replaced by an on-map network visualization (Feature 6).
2. **Deliberate UX changes that are half-landed** — depots are meant to live on the farm
   profile page but are still created/edited as free-standing entries from a global "New depot"
   button; the "inline editor mode" idea (profile page becomes editable in place) does not
   exist yet — editors are classic stacked forms in the drawer.
3. **Design polish** — the goal is a polished, modern shadcn app in the spirit of Google
   Maps / Airbnb / Booking.com, not a re-skin of the legacy design: richer entry cards,
   list ↔ map hover coupling, grouped command-style search, refined detail pages, deliberate
   marker/popup styling, and a first-class mobile bottom-sheet experience.

Users are CSA (solidarische Landwirtschaft) farmers and consumers in DE/AT/CH; the map is the
primary public discovery surface and the only editing surface for farm operators.

## Features

### Track A — Feature parity

1. **Geocoder address field in editors**
   - Description: Replace the nine plain address inputs (`AddressFields.svelte`) with a
     geocoder search control matching legacy `GeocoderSearchField`: a single autocomplete input
     (300 ms debounce, min 2 chars) backed by the existing `getAutocompleteSuggestions()` —
     called with `withEntries: false`, i.e. **location suggestions only**, never
     farms/depots/initiatives (unlike the sidebar search) — and `geocodeLocationId()` in
     `$lib/api/discovery.ts`. Selecting a suggestion populates
     address, street, housenumber, city, state, country, postalcode, latitude, longitude in the
     form model — those fields are **not shown to the user** and there is no manual lat/lon
     entry (legacy behavior: the geocoder is the only way to set a location; users whose exact
     address is not found pick at least their village/town). Show a small map preview with the
     correct entry-type marker once coordinates exist, at a fixed moderate zoom (~14, matching
     legacy `PreviewTile`) — location precision stays limited by the app-wide max zoom (15),
     which is the existing privacy mechanism and must be preserved.
   - Acceptance criteria:
     - Typing "Berlin" in the farm editor address field shows location suggestions; selecting
       one fills the hidden address/coordinate fields and renders the map preview with a farm
       marker at the selected position.
     - No individual address or lat/lon inputs are visible in any editor; the only address
       input is the geocoder field.
     - Suggestions contain only geographic locations, no entry (farm/depot/initiative) results.
     - Editing an entry that already has an address shows that address in the geocoder input
       (legacy format: "address, city") and keeps the stored coordinates — an untouched
       geocoder field submits the existing location unchanged.
     - Clearing the geocoder input clears all address model fields (legacy behavior).
     - Submitting without a geocoder selection shows a translated error on the geocoder field
       ("enter and select an address"); typed-but-unselected text does not count as a location.
     - The preview map renders at a fixed zoom that does not exceed the app max zoom.
     - Works identically in farm, initiative, and depot editors.

2. **Farm and initiative deletion**
   - Description: Implement the deferred delete action (see `handleDeleteEntry` stub in
     `MapSidebar.svelte`) for farms and initiatives: confirm dialog (existing `confirmDialog`
     store), `DELETE` API calls in `$lib/api/entry-mutations.ts`, feedback toast, my-entries
     list refresh, and navigation back to my-entries. For farms with connected depots, the
     dialog copy follows the ownership model from Feature 8: depots owned by the same user may
     be deleted along with the farm (after the dialog says so); depots owned by **other**
     users must never be deleted by a farm deletion — they are detached. Verify actual API
     behavior against the new FK constraints in packages/api first and align copy (and, if
     needed, API behavior) with this rule.
   - Acceptance criteria:
     - Owner can delete a farm/initiative from the my-entries row actions and sees a
       confirmation dialog naming the entry.
     - After confirming, the entry disappears from my-entries and from the map without a page
       reload, and a success toast appears.
     - Deleting a farm with own depots states in the dialog that those depots are removed (or
       detached — whichever is implemented) and does exactly that, covered by an e2e test.
     - Deleting a farm with a depot owned by another account leaves that depot intact.
     - Cancel in the dialog performs no mutation.

3. **Editor validation and field parity**
   - Description: Bring `editor-schema.ts` up to legacy joi parity: `url` must be a valid
     http(s) URL when present, string maxlengths (name/city/street/etc. 255, description/
     participation/economicalBehavior/additionalProductInformation 1000), maximumMembers a
     non-negative integer, foundedAtMonth 1–12. Mark required fields visually. Render badge
     logos (`badge.logo`, linked `badge.url`) next to editor badge checkboxes like the detail
     view's `BadgesList`. Add the account-info box legacy shows in every editor ("this entry is
     linked to <email>", link to edit account) and the initiative editor intro text.
   - Acceptance criteria:
     - Submitting `url = "not a url"` shows a translated inline error and blocks submit.
     - A 300-char name is rejected client-side with a translated message.
     - Badge checkboxes in the farm editor show the badge logo images.
     - Every editor shows the signed-in user's email with a working "edit contact data" link.
     - Required fields (name, city, address via geocoder) carry a visible required indicator.

4. **Global toast feedback (sonner)**
   - Description: Mount the vendored `ui/sonner` Toaster once in `+layout.svelte` and use
     toasts for async outcomes that legacy communicated via react-s-alert: sign-in/out success,
     sign-up confirmation-mail hint, account activation and reactivation results
     (`AccountTokenHandler`), entry create/update/delete success, contact-message sent, and
     unexpected API errors. Replace the current URL-query-based `DepotMutationFeedback`
     inline banner with the same toast pattern (keeping the "view farm" action as a toast
     action button).
   - Acceptance criteria:
     - Signing in shows a success toast with the user's name; signing out shows one too.
     - Saving any editor shows a success toast; a failed save shows a destructive toast while
       inline field errors still render.
     - Opening the app with a valid `confirmation_token` shows the activation success toast.
     - Depot create/update/delete feedback appears as a toast with a working "show farm"
       action; the `depotAction` query-param banner flow is removed.

5. **Mobile bottom-sheet UX**
   - Description: Turn the mobile sidebar (currently a fixed-height floating box,
     `h-[min(70vh,36rem)]`) into a proper bottom sheet in the Google-Maps style: drag handle,
     three snap points (peek ≈ header only, half, full), swipe between them, map interactions
     stay available at peek/half. Detail views open at half height and expand; editors and the
     create wizard open full-height. Audit touch targets (≥44 px), keep the search input above
     the keyboard, respect safe-area insets, and reposition map controls/user nav so nothing
     overlaps the sheet. The three mobile concept screenshots in `design-references/` map 1:1
     onto the peek/list/detail states and are a useful (non-normative) proportion reference —
     see `design-direction.md`.
   - Acceptance criteria:
     - On a 390×844 viewport the list appears as a bottom sheet with a visible drag handle and
       can be dragged between peek/half/full; the map remains pannable at peek.
     - Tapping a marker opens the detail sheet at half height; dragging up reveals the full
       profile; dragging down to peek returns to the map without losing the selection.
     - Editors occupy the full height with a sticky save bar that is not covered by the
       on-screen keyboard.
     - Existing responsive e2e tests pass; a new e2e covers the snap-point interaction.

6. **Farm↔depot network visualization on the map**
   - Description: When a farm profile is open, visualize the farm's network directly on the
     main map: connection lines (GeoJSON `LineLayer`, styled via map design tokens) from the
     farm to each of its depots, with the involved markers highlighted; optionally fit the
     viewport to the network bounds when the profile opens. When a depot is selected (marker
     click, search result, or deep link resolves to its farm), the same network renders for
     the owning farm with the selected depot emphasized. Closing the profile removes the
     visualization. (This replaces the legacy experimental `NetworkWidget`, which is dropped —
     see Out of Scope.)
   - Acceptance criteria:
     - Opening a farm profile with depots draws visible connection lines from the farm marker
       to each depot marker; closing the profile removes them.
     - The map viewport adjusts so the farm and its depots are all visible (respecting the
       sidebar offset).
     - Clicking a depot marker highlights the depot, its farm, and their connection.
     - Line/highlight colors come from map design tokens and work in all registered themes.
     - No network layer renders for initiatives, or for farms that have no depots.

7. **Chrome parity odds and ends**
   - Description: Show the external help link (config `externalHelpUrl`) in the user
     navigation when configured, as legacy did; add the onboarding intro texts to sign-in and
     sign-up (including the "this view requires sign-in" variant when redirected); verify all
     footer/attribution links match legacy (site, privacy, imprint, map data) — already mostly
     present via the attribution control. Remove the placeholder `search-widget` (console-log
     stub) from the widgets build until a real use case exists.
   - Acceptance criteria:
     - With `externalHelpUrl` configured, a help link opens in a new tab from the user nav in
       both signed-in and signed-out states; with it empty, no link renders.
     - Navigating to a protected route while signed out shows the sign-in view with the
       protected-view explanation text.
     - No stub widget ships in `npm run build:widgets` output.

### Track B — Deliberate UX changes

8. **Depots live on the farm profile (single-ownership default, legacy accommodation)**
   - Description: Make the farm profile page the home of its depots, with a clear ownership
     model. **Going forward (default)**: depots are created from the farm profile — the farm
     owner sees an "Add pickup location" action; the depot editor opens pre-associated with
     that farm (farm select hidden), and mutations return to the farm profile. The my-entries
     "New depot" shortcut stays but only offers the user's **own** farms, so new farm+depot
     networks are always single-owner. **Legacy accommodation**: existing depots attached to
     another user's farm remain valid — the farm profile lists _all_ connected depots, but
     edit/delete actions render only for users who own the depot; depot owners keep managing
     their depots via my-entries even when attached to a foreign farm (shown grouped under the
     farm's name with an "owned by another account" hint on the farm). No forced ownership
     transfer or data migration. Presentation: replace the plain name-only depot list in
     `FarmDetail.svelte` with depot cards (name, address, delivery days); tapping a card
     pans/zooms the map to the depot and highlights its marker (ties into Feature 6). In
     my-entries, depots are always grouped under their farm (never a flat mixed list); for a
     foreign farm the group header carries the "owned by another account" hint. Route compat:
     `#/depots/:id` keeps resolving to the owning farm's profile; `#/depots/new` opens the
     farm-selection-first create flow; `#/depots/:id/edit` keeps opening the depot editor.
   - Acceptance criteria:
     - A farm profile lists each connected depot as a card with address and delivery days;
       clicking a card pans the map to the depot.
     - As the farm owner, "Add pickup location" on my farm's profile opens the depot editor
       with the farm preselected and not editable; saving returns to the farm profile where the
       new depot card appears.
     - The my-entries "New depot" shortcut lists only farms the user owns; a user with no
       farms is pointed to creating a farm first (legacy had the same hint).
     - Editing/deleting a depot from the farm profile works with confirm dialog + toast and
       returns to the profile — but only for depots the user owns; foreign-owned depots show
       no edit/delete actions on the farm profile.
     - My-entries shows depots grouped under their farm — own depots under own farms, and a
       legacy cross-owned depot remains editable by its owner there, grouped under the
       (foreign) farm's name.

9. **Profile edit mode (inline editing, approximated)**
   - Description: Approximate the "inline editor" idea with a section-based edit mode rather
     than literal per-word contenteditable. Edit mode applies to **farm and initiative
     profiles** (the two entry types that have profile pages). The profile (detail) page and
     the editor share one section structure (header/identity, description, products, economic
     behavior, membership, badges, depots). An "Edit" action switches the profile into edit
     mode: each section renders its form-control variant _in the same position and visual
     order_ as the read view (title text → name input, description paragraph → textarea,
     product chips → checkbox grid, membership line → radio group), with one sticky
     Save/Cancel bar and the existing unsaved-changes guard. Read and edit variants live
     side-by-side per section component so layout parity is enforced by construction.
     **Depots are the exception**: they have no profile page, so the depot editor stays a
     compact classic form (opened from the farm profile per Feature 8); in farm edit mode the
     depots section does _not_ inline-edit depot fields — it shows the same add/edit/delete
     affordances as the read view, which navigate to the depot form. Creation does **not**
     use inline mode: a new entry starts with a short guided wizard (type-specific steps:
     identity & location → details → membership/goals) and lands on the new profile in edit
     mode for refinement. The classic full-form editor routes for farms/initiatives are
     replaced by this mode (URLs stay: `#/farms/:id/edit` opens the profile in edit mode).
   - Acceptance criteria:
     - Pressing Edit on an owned farm profile keeps the page visually recognizable (same
       section order/position) while text/lists become inputs/checkbox groups; Save persists
       and returns to read mode showing the updated values.
     - Cancel with modified fields triggers the unsaved-changes confirm.
     - Validation errors render inside the affected section, and the save bar indicates which
       section has errors.
     - `#/farms/new` opens the creation wizard; completing it creates the farm and shows its
       profile.
     - Deep links to `#/farms/:id/edit` open edit mode directly (route compat preserved).

### Track C — shadcn design polish

> Visual direction for all Track C features: see [`design-direction.md`](./design-direction.md)
> (palette, typography, iconography, mood — distilled from the non-normative concept
> screenshots in `design-references/`). The spec defines _what_ to build; the design
> direction informs _how it should look and feel_.

10. **Command-style search in the drawer (not a global palette)**
    - Description: The search stays exactly where it is — the input in the drawer header —
      and only its internals are rebuilt on the shadcn `Command` (cmdk) primitive used
      _inline/anchored_, not as a `CommandDialog` modal: the suggestion panel opens under the
      input inside the drawer, overlaying the entry list (which is the Google Maps model:
      search box at the top of the panel, results drop down in the panel, map stays visible).
      What Command adds over the current `SearchSuggestions` dropdown is grouped sections
      (Locations / Farms / Depots / Initiatives) with type icons, proper listbox keyboard
      navigation (arrows + Enter, Escape closes), loading state, and a designed empty state
      ("no results for …"). Interaction with drawer states: while a **detail view** is open,
      the drawer keeps a slim persistent header with back button + search input (searching
      from a profile is allowed and replaces the detail view on selection — Google Maps
      behavior); while an **editor / create wizard** is open, no search renders (focused
      task, guarded by unsaved-changes). When the drawer is collapsed, the `/` or `⌘K`
      shortcut expands it and focuses the search — shortcut listeners must be scoped to the
      app root (the app also ships as an embed inside host pages and must never capture
      keystrokes typed outside the embed). On mobile, focusing the search raises the
      bottom sheet to full height with the keyboard open (Booking.com-style takeover), rather
      than opening a separate overlay.
    - Acceptance criteria:
      - Search suggestions render inside the drawer, anchored under the input, grouped with
        headings and icons; arrow keys + Enter select; Escape closes the panel and keeps the
        query.
      - `/` (and `⌘K`) focuses the drawer search from the map on desktop, expanding the
        drawer first if it is collapsed; in an embedded build, keystrokes outside the embed
        host element are never captured.
      - With a farm profile open, the drawer header still offers the search; selecting a
        result navigates away from the profile (with map pan) without an intermediate step.
      - No search input is visible while an editor or the create wizard is open.
      - On mobile, tapping the search raises the sheet to full height; dismissing the
        keyboard returns to the previous snap point.
      - An unmatched query shows a designed empty state, not a blank dropdown.

11. **Entry list and card redesign**
    - Description: Upgrade `EntryCard`/`EntriesList` toward Airbnb-style result cards: type
      chip (Badge), name, address line, membership status (colored dot + label for farms),
      product category summary, and a subtle divider-free card layout with hover state.
      Couple list and map: hovering a card highlights the corresponding marker; hovering a
      marker highlights the card and scrolls it into view. Add skeleton rows while entries
      load and a designed empty state for empty viewports/filters.
    - Acceptance criteria:
      - Cards show type, membership status, and product summary where available.
      - Hovering a list card visibly highlights the map marker and vice versa (desktop).
      - Loading shows skeleton cards; an empty result set shows an empty state with a
        "reset filters / zoom out" action.

12. **Detail profile polish**
    - Description: Restructure the profile page as a scannable modern profile: header block
      with type icon/avatar, name, founded line, membership status chip; action row (Contact
      CTA as primary button, Edit for owners, share/copy-link); content sections separated by
      `Separator` with consistent `Heading`/`Paragraph` use; products as chip clusters instead
      of `list-disc` bullets; a back affordance that returns to the list preserving scroll
      position (Google Maps behavior), in addition to close — housed in the slim persistent
      drawer header (back + search) defined in Feature 10.
    - Acceptance criteria:
      - Products/goals render as chips grouped by category, not bullet lists.
      - The contact CTA is a primary button in a sticky footer area of the drawer.
      - Back from a detail view restores the previous list scroll position and viewport.
      - The header shows membership status as a colored chip consistent with card styling.

13. **Map visual language**
    - Description: Make markers/clusters/popups feel designed and consistent with the app
      theme: distinct hover and selected marker states (selected marker scales/changes color
      and stays highlighted while its profile is open), cluster circles with count styling
      consistent with the token palette, popup restyled on card tokens (background/foreground,
      border radius, shadow — replacing the current 0.8-opacity dark box), and the dev zoom
      indicator hidden outside dev builds (already dev-gated; keep it that way).
    - Acceptance criteria:
      - The marker for the open profile is visually distinct until the profile closes.
      - Popups use card background/foreground tokens and match the app radius scale in both
        themes.
      - Hovering a marker gives visible feedback beyond the cursor change.

14. **App chrome & consistency pass**
    - Description: A sweep to make the shell feel like one designed product: align the
      floating elements (user nav pill, sidebar shell, map controls) on a shared radius and
      elevation scale (revisit the `rounded-4xl` shell vs shadcn's radius tokens); consistent
      focus-visible rings; `Skeleton` for every async surface (detail load, my-entries);
      designed error states for failed loads; audit spacing to the `gap-2/4/6` ladder; ensure
      keyboard/dialog accessibility (focus trap in sheets, escape behavior); verify both
      themes (`teikei`, client themes) render all new components correctly.
    - Acceptance criteria:
      - All floating chrome uses the same radius/elevation tokens (documented in DESIGN.md).
      - Every data-loading surface has a skeleton or spinner and a designed failure state.
      - Axe/perf sanity e2e (`perf-accessibility-sanity.test.ts`) passes after the changes.

## Technical Solution

- **Architecture**: All work stays inside `packages/map-next`, following the documented
  component hierarchy (`routes → domain → semantic → ui`) and shadcn-svelte rules in
  `src/lib/components/README.md`. No API changes expected except verifying farm-delete
  cascade behavior against packages/api (which recently gained real FK constraints).
- **i18n**: every new user-facing string (labels, dialogs, toasts, empty states, validation
  messages) is added to the paraglide message files for **all** locales
  (`messages/de-de.json`, `de-at`, `de-ch`, `fr-ch`). Validation/geocoder error keys are
  resolved via `translateErrors`, which looks messages up in those same paraglide
  `messages/*.json` files, so the keys must be added there too (there is no separate
  `validations.json` in map-next — that file belongs to the legacy `packages/map` app). No
  hard-coded strings in components.
- **Design tokens (Track C)**: visual decisions follow `design-direction.md`; candidate
  token adjustments (deeper brand green for `--primary`, cream panel background, optional
  `--font-family-serif` accent) are decided once during F14 and
  land in `theme-vars.css` / `DESIGN.md` / the Storybook token stories — never as raw values
  in components.
- **Geocoder**: new `forms/GeocoderField.svelte` (semantic layer) built on `InputGroup` +
  suggestion list (reuse/extract the sidebar `SearchSuggestions` pattern or the new Command
  primitive from Feature 10), wired to `$lib/api/discovery.ts`. Address model fields stay in
  the superforms schema but render no inputs; only the geocoder selection writes them.
  Preview map as a tiny non-interactive MapLibre instance at fixed zoom, reusing
  `map-style.ts` tokens.
- **Sections for inline edit (F9)**: introduce `domain/<type>/sections/` components that each
  export read and edit variants sharing one layout wrapper; edit mode composes them with the
  existing `superForm` instance (one form per profile, sections bind into it). Editor routes
  keep their `+page.ts` loaders; the drawer decides read vs edit from route kind. The
  existing `EntryEditor`/`DepotEditor` are decomposed into these sections rather than kept in
  parallel.
- **Bottom sheet (F5)**: prefer a purpose-built sheet with snap points (e.g. `vaul-svelte`)
  over extending the shadcn `Sheet`; wrap it as a `layout/` component so desktop keeps the
  current floating sidebar and mobile swaps the container only — MapSidebar content stays
  identical.
- **Toasts (F4)**: `svelte-sonner` Toaster mounted once in `+layout.svelte`; a thin
  `$lib/utils/toast.ts` wrapper exposing success/error helpers with translated messages.
- **Network visualization (F6)**: a `domain/map/NetworkLayer.svelte` rendering a GeoJSON
  source of LineStrings computed from the open farm's coordinates + its depots' coordinates
  (available on the loaded detail data), plus a highlight state shared with the marker
  layers; driven by the same `page.data.detailData` the sidebar uses. New map tokens for line
  color/width in `theme-vars.css`.
- **Key decisions**:
  - Location entry is geocoder-only (legacy parity): no visible address/lat-lon fields, and
    location precision remains limited by the max-zoom cap rather than coordinate blurring.
  - Inline editing is approximated with section-level edit mode + creation wizard, not
    contenteditable — layout parity is enforced by shared section components (accepted
    trade-off: controls look like controls in edit mode, which is better for a11y/validation).
  - Depot ownership: single-owner farm+depot networks are the default path for new data;
    legacy cross-owned depots stay valid and manageable by their owners — accommodation in
    the UI, no data migration or forced ownership transfer.
  - Depot creation moves into the farm-profile context; the depot remains a separate API
    entity — only the UX subordinates it to the farm.
  - Mobile keeps one component tree; only the drawer container differs per breakpoint.

## Out of Scope

- The legacy embeddable `NetworkWidget` — experimental, never used in production; dropped in
  favor of the on-map network visualization (Feature 6).
- Depot ownership transfer flow (moving a legacy cross-owned depot to the farm owner's
  account) — possible follow-up once Feature 8's model is live.
- Backend/API changes (new endpoints, schema changes); packages/api FK work is separate.
- Account deletion (not in the legacy app either).
- New map data sources or replacing VersaTiles/MapLibre.
- Retiring/removing `packages/map` itself and deployment cutover.
- Native apps, offline support, SEO/SSR (the app stays an SPA/embed).
- Redesigning the email templates or API-side i18n.

## Additional Notes

- **Open question (F2/F8)**: actual API behavior when deleting a farm with depots (cascade vs
  restrict under the new FK constraints) must be verified first, and the API currently allows
  attaching depots to arbitrary farms — Feature 8's "own farms only" rule is client-side
  unless the API adds enforcement (acceptable for now, flag for a later API change).
- **Decision taken (F8)**: single ownership is the default for new depots; legacy cross-owned
  depots are accommodated read-only from the farm owner's perspective rather than migrated.
- **Open decision (Track C)**: whether to adopt the serif accent for profile long-form text
  (see `design-direction.md` § Typography). Default is all-sans; adopting serif is a single
  deliberate decision in F14, applied only through the `typography/` components.
- **Risk (F9)**: decomposing `EntryEditor` into shared sections while keeping the e2e suite
  green is the largest refactor; do F1–F4 first so the section components are built on the
  final validation/geocoder behavior.
- **Sequencing suggestion**: Track A (F1–F4, F7) → F8 → F9 → Track C (F10–F14) → F5/F6 can
  run parallel to Track C. Feature 5 before Track C polish if mobile is a launch requirement.
- The memory-indexed `packages/map-next/docs/GAP-ANALYSIS.md` does not exist on this branch;
  this spec supersedes it as the roadmap document.
