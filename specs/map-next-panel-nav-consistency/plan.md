# Implementation Plan: Consistent panel navigation for the contact view (map-next)

Spec: specs/map-next-panel-nav-consistency/spec.md

Status legend: [ ] todo · [~] in progress · [x] done

- [x] 1. Routed contact view (depends on: none)
  - [x] 1.1 Add `farm.contact(id)` and `initiative.contact(id)` to `hashRoutes`/`routeBuilders` in `src/lib/utils/routes.ts`, and extend the route parser/matchers (`HashRouteKind` section) to recognize the new paths.
  - [x] 1.2 Add loaders `src/routes/farms/[id]/contact/+page.ts` and `src/routes/initiatives/[id]/contact/+page.ts` that reuse the detail loaders via `loadCatching` and return the detail payload under a contact marker (e.g. `contactData`), including the existing `loadError` path.
  - [x] 1.3 In `MapSidebar.svelte`, derive the contact mode from `page.data.contactData` in the existing `{#if}` chain and render `EntryContactView` + `EntryContactForm` there; pan/focus the map on the entry the same way the detail branch does (deep-link parity).
  - [x] 1.4 Redirect owners: when the signed-in user can edit the entry (same `canEdit` logic that hides the contact CTA), navigate from the contact route to the entry's detail route.
  - [x] 1.5 Remove the `showContactForm` local state and contact branch from `FarmProfile.svelte` and `InitiativeProfile.svelte`; change the contact CTA to `goto(routeBuilders.….contact(id))`; contact back button and successful send `goto` the detail route, keeping the success toast.
  - [x] 1.6 Update `e2e/contact-drawer.test.ts` for the routed flow (URL hash changes, browser back → detail) and add a deep-link test that loads `#/farms/:id/contact` fresh and sees the form.
- [x] 2. Focused-task header for the contact view (depends on: 1)
  - [x] 2.1 Treat contact as a task level in `MapSidebar.svelte`/`SidebarShell.svelte`: no `SlimSearchHeader` for the contact branch, `focusSearch()` no-ops while contact is open, `shellMode` behaves like `editor` (mobile sheet opens at `full`, collapse forbidden).
  - [x] 2.2 Add test assertions: contact view renders no search input and exactly one back button (component spec or e2e), and the mobile sheet opens at `full` (extend `e2e/bottom-sheet.test.ts` or the contact e2e); verify list and detail views are unchanged.
- [ ] 3. Document the sidebar navigation rule (depends on: none)
  - [ ] 3.1 Add a "Sidebar navigation" subsection under "Code Organization" in `packages/map-next/README.md` stating the rule: browse levels → search + region filters; selected-entry level → pivot search + back (restores pre-detail camera and list scroll) + X (deselects in place); task levels (editors, contact form) → single back button, no search.
  - [ ] 3.2 Update the "focused-task rule" comment in `MapSidebar.svelte` to reference the README section so the comment and doc stay linked.
