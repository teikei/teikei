# Spec: Consistent panel navigation for the contact view (map-next)

## Problem Statement

The map-next sidebar has three stacked levels: the entry list, the entry detail
(profile), and the contact form. List and detail behave consistently, but the
contact view does not:

- It renders **two stacked back buttons** that do different things — the top one
  (in the slim search header) drops all the way to the list, the inner one (next
  to the entry name) returns to the profile.
- It shows the **search bar**, although the contact form is a focused task. Because
  the form is unrouted local component state, tapping a search suggestion — or the
  top back arrow — silently discards a half-written message with no confirmation.
- It has **no route**: browser back from the contact form jumps to the list (the
  hash never changed while opening the form), breaking the stack model for anyone
  using the browser back button, and the view is not deep-linkable.

The codebase already has the right principle for focused tasks: the entry editors
deliberately render no search header ("focused-task rule" in `MapSidebar.svelte`).
The contact form should follow the same convention. The governing rule, to be
written down as part of this work:

> **Browse levels get browse tools (search, region filters); the selected-entry
> level gets pivot search + back + dismiss (X); task levels (forms, editors) get a
> single back button and nothing else.**

List and detail views stay as they are (search + filters in list; search, back,
X, and permalink in detail — back restores the pre-detail camera and list scroll,
X only deselects).

## Features

1. **Routed contact view**
   - Description: The contact form becomes a hash-routed view instead of local
     state inside the profile components. New routes `#/farms/:id/contact` and
     `#/initiatives/:id/contact` (no depot variant — depots resolve to their
     owning farm's profile). The profile's "contact" CTA navigates to the route;
     the contact view's back button and a successful send navigate back to the
     entry detail route.
   - Acceptance criteria:
     - Opening the contact form from a farm or initiative profile changes the URL
       hash to `#/farms/:id/contact` / `#/initiatives/:id/contact`.
     - Loading that URL directly (fresh page load) shows the contact form for the
       entry, with the map focused on the entry, same as navigating there by click.
     - Browser back from the contact view returns to the entry detail view, not
       the list.
     - The in-app back button on the contact view returns to the entry detail
       view; a successful send returns to the detail view and shows the existing
       success toast.
     - Deep-linking to the contact route of an entry the signed-in user can edit
       (owners don't get a contact CTA) redirects to the entry's detail route.
     - Route builders in `src/lib/utils/routes.ts` cover the new routes; no raw
       hash strings at call sites.

2. **Focused-task header for the contact view**
   - Description: The contact view no longer renders the slim search header. It
     renders exactly one header: back arrow + entry name (the existing
     `EntryContactView` header), following the editors' focused-task convention.
   - Acceptance criteria:
     - The contact view shows no search input and no second back button — exactly
       one back arrow is visible.
     - `focusSearch()` (e.g. keyboard shortcut) is a no-op while the contact view
       is open, matching editor behavior.
     - On mobile, the contact view opens the bottom sheet at `full` and stays
       expanded, matching editor behavior (a form needs the space; it is a
       focused task, not a browse level).
     - The list and detail views are visually and behaviorally unchanged (list:
       search + filters; detail: slim search header with back, plus permalink and
       X in the profile header; back still restores pre-detail camera and list
       scroll, X still only deselects).

3. **Document the sidebar navigation rule**
   - Description: Write the summary rule down where future contributors will see
     it: a short "Sidebar navigation" subsection in `packages/map-next/README.md`
     (under "Code Organization"), stating the three levels, which tools each level
     gets, and the back-vs-X semantics on the detail level. Reference it from the
     existing "focused-task rule" comment in `MapSidebar.svelte` so the code
     comment and the doc don't drift apart.
   - Acceptance criteria:
     - `packages/map-next/README.md` contains the rule: browse levels → search +
       filters; selected-entry level → pivot search + back (restores context) +
       X (deselects in place); task levels → single back button, no search.
     - The `MapSidebar.svelte` focused-task comment points to that README section.

## Technical Solution

- Architecture: Follow the existing hash-route pattern. New SvelteKit routes
  `src/routes/farms/[id]/contact/+page.ts` and
  `src/routes/initiatives/[id]/contact/+page.ts` reuse the detail loaders (wrap in
  `loadCatching` like the others) and return the detail payload plus a marker
  (e.g. `contactData`). `MapSidebar.svelte` derives the contact mode from route
  data in its existing `{#if}` chain and renders `EntryContactView` +
  `EntryContactForm` directly — `FarmProfile`/`InitiativeProfile` drop their
  `showContactForm` local state and contact branch; their CTA becomes a `goto` to
  the new route. `shellMode` treats contact like `editor` (no search header,
  mobile sheet at `full`, collapse forbidden).
- Technologies: no new ones — Svelte 5 / SvelteKit hash router, existing
  `routeBuilders`, existing components.
- Key decisions:
  - Contact is classified as a **task level** (like editors), not a detail
    sub-view — that single decision drives header, search, mobile snap, and
    keyboard behavior. Alternative (keep slim search header, remove only the
    inner back) was rejected: search-away from a dirty form is silent data loss.
  - No "discard message?" confirmation dialog: with the search header gone, the
    only in-app exit is the deliberate back button; browser back is likewise
    deliberate. Revisit only if users report draft loss.
  - Owner deep-link redirects to detail rather than rendering the form, matching
    the existing rule that owners see edit affordances instead of a contact CTA.
  - Error states for the contact routes reuse the existing `loadError` →
    `ErrorState` path.

## Out of Scope

- Any changes to list or detail view layout, headers, or the back/X semantics.
- Draft persistence for the contact form (surviving reload or navigation).
- A dirty-form discard confirmation dialog.
- Contact routes for depots or locations.
- Legacy-route aliases (there is no legacy contact URL to map).

## Additional Notes

- Existing e2e coverage to update/extend: `e2e/contact-drawer.test.ts` (flow now
  crosses routes), plus a new assertion in `e2e/legacy-routes.test.ts`-style
  deep-link tests for the contact routes if that's where deep-link coverage
  lives.
- The contact form component (`EntryContactForm.svelte`) and the send API are
  unchanged; only mounting and navigation move.
- Assumption: unauthenticated visitors can use the contact form today (no
  sign-in gate); the routed view keeps whatever gating currently exists — this
  spec does not change access rules.
