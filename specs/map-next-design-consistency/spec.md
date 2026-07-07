# Spec: map-next Design Consistency & UX Polish Pass

## Problem Statement

A design/UX review of `packages/map-next` (2026-07-07, desktop app at 1440px, code audit of `src/lib/design`, `src/lib/components`, `src/routes`) found that the app's foundation is solid — a documented token system (`src/lib/design/theme-vars.css`, `DESIGN.md`), a calm green/olive/cream palette, and deliberate UX patterns — but the implementation has drifted from the system and mixes interaction models. The result: forms and secondary buttons with almost no contrast against their background, three different heading treatments on a single profile page, inconsistent corner radii, an edit mode that doesn't visually map to the profile it edits, auth/account dialogs that all show sign-up onboarding copy, and three different mental models for creating vs. editing entries.

This spec covers a consistency and polish pass that fixes these issues **within** the existing design system rather than redesigning it. Beneficiaries are end users (farms, initiatives, depot managers and consumers using the map) and future contributors, who get one enforced pattern per problem instead of several competing ones.

## Features

1. **Control contrast: inputs, secondary buttons, destructive actions**
   - Description: Structure is currently carried only by fill and shadow. Inputs are `bg-input/50` with a transparent border (`src/lib/components/ui/input/input.svelte`, same language in `select-trigger.svelte`); `outline` buttons are white with a hairline border, indistinguishable from the white cards/list background; `AppButton.svelte` exposes only `default`/`outline`, so delete buttons ("Löschen") render identically to neutral actions even though `Button` already has a tinted `destructive` variant. Give inputs a visible resting border and/or stronger fill, give outline/secondary buttons a visible boundary or olive-tinted fill, and expose the `destructive` (and `ghost` where needed) variants through `AppButton`.
   - Acceptance criteria:
     - Text inputs, textareas, and select triggers have a visible boundary (border or fill) with ≥3:1 contrast against both the cream sidebar (`--sidebar`) and white card backgrounds (WCAG 1.4.11), verified with a contrast checker on the computed colors.
     - Outline/secondary buttons are visually distinguishable from their background on the sidebar, on white cards, and in the "Meine Einträge" list without relying on hover.
     - All delete/destructive actions in the app ("Löschen" in MyEntries list, depot cards, editors) use the destructive-tinted variant and look different from neutral secondary buttons.
     - Existing focus-ring behavior (`focus-visible:ring-3 ring-ring/30`) is unchanged.

2. **Profile typography: one heading system, calmer rhythm, no serif**
   - Description: Profile pages mix `Heading level={5}` (green, `text-base`), raw `<h4 class="text-sm font-semibold">` (black — `FarmDepotsSection.svelte`, `EntryContactForm.svelte`), raw `<h2 class="text-foreground">` for the entry name, and bold inline labels ("Maximale Mitgliederzahl: 121"). Body copy is nearly all `text-sm`, so headings barely outrank body text, and sections sit in a uniform tight `divide-y` + `py-4` rhythm. The description paragraph uses a system serif stack (Iowan/Palatino) that renders inconsistently and looks accidental. Decision: all section headings on profiles use one green `Heading` treatment one size step above body; fact-style data (max members, SoLaWi seit) becomes a small definition list; **serif is dropped entirely** (profiles and auth intros render in Inter); section vertical spacing is loosened.
   - Acceptance criteria:
     - Every section heading in farm/initiative/depot profiles (read mode) uses the same `Heading` component, same level, same color; no raw `<h3>/<h4>` with ad-hoc classes remain in `src/lib/components/domain/**`.
     - No `font-serif` usage remains in the app (`Paragraph serif` variant removed or unused); `--font-serif` token may stay defined but unreferenced.
     - Key-value facts render as a consistent definition-list pattern, not bold inline prose.
     - Section spacing on profiles is visibly looser than the current `py-4` (e.g. `py-5`/`py-6`), consistent across all sections.

3. **Two-tier radius system**
   - Description: Nearly everything uses `rounded-4xl` (~26px: buttons, cards, dialogs, sidebar) / `rounded-3xl` inputs, while depot cards inside profiles already drift to `rounded-md`. Codify a two-tier rule in `DESIGN.md` and apply it: **container surfaces** (sidebar shell, dialogs/sheets, bottom CTA bar, search pill) keep the large signature radius; **controls** (buttons, inputs, selects) step down to `lg`/`xl`; **nested elements** (list rows, dropdown/command items, in-card sub-cards like depot cards) use `md`. Buttons should not be full pills.
   - Acceptance criteria:
     - `DESIGN.md` documents the two-tier (container/control/nested) radius rule with the concrete Tailwind classes per tier.
     - Buttons and inputs no longer use `rounded-4xl`/`rounded-3xl`; they use the documented control radius.
     - Depot cards, list rows, and dropdown items use the documented nested radius — the current `rounded-md` outlier on depot cards becomes the rule, not a violation.
     - Sidebar shell, dialogs, and the search input keep their current large radius (visual signature preserved).

4. **Edit-mode parity with the profile display**
   - Description: Read mode renders ordered sections; edit mode swaps the whole drawer into one long form where section headings largely disappear, field order differs from read order, terminology changes ("Mitgliedschaften" → "Verbände und Netzwerke"; "Wirtschaftsweise" bullet → bio checkbox + "Erläuterungen"), the name jumps into a header input, and two "Abbrechen" buttons are visible at once (header + sticky save bar). `ProfileSection.svelte` was built for parity ("layout stays identical by construction") but the promise isn't kept. Make edit mode render the **same sections, same headings, same order, same wording** as read mode, swapping only each section's body; exactly one Cancel affordance.
   - Acceptance criteria:
     - For a farm and an initiative, the sequence of section headings in edit mode is identical (text and order) to read mode; toggling Bearbeiten keeps each section in the same screen position (± natural height change from form controls).
     - No terminology differs between modes for the same section (one term chosen per section and used in both).
     - Exactly one Cancel and one Save control are visible in edit mode (the sticky `EditorSaveBar`); the header shows the entry name as a heading with the name field editable inside its Identity section, or an equivalent single-location solution.
     - This applies to farm, initiative, and depot editors.

5. **Contact form as its own drawer view**
   - Description: The footer CTA "Kontakt aufnehmen" currently appends the contact form as the last profile section; sender fields are empty even when logged in; the CTA shows on the user's own entries. Change: the CTA opens a dedicated contact view in the drawer (same navigation pattern as the editor) with a back button to the profile; name/email prefill from the session; CTA hidden on entries the user owns.
   - Acceptance criteria:
     - Clicking "Kontakt aufnehmen" replaces the drawer content with a contact view (entry name visible, back button returns to the profile with scroll position preserved or reset to top — pick one and be consistent).
     - For a logged-in user, name and email are prefilled and editable.
     - The CTA does not render on entries owned by the current account.
     - Successful send returns to the profile with a success toast (existing `sonner`).

6. **Collapsible depot list on farm profiles**
   - Description: `FarmDepotsSection.svelte` renders an always-expanded list of depot cards; large networks produce a very long, unscannable section. Show a compact one-line row per depot (name + place, details on click as today), cap the initial list at ~5 with an "Alle N anzeigen" toggle, and put the count in the section heading.
   - Acceptance criteria:
     - A farm with >5 depots initially shows 5 rows plus a toggle labeled with the total count; toggling expands/collapses without navigation.
     - Section heading shows the depot count.
     - Owner actions (Bearbeiten/Löschen per depot, "Abholstelle hinzufügen") remain available and use the button variants from Feature 1.

7. **Farm multi-select as autocomplete combobox in depot editor**
   - Description: "Zugehörige Höfe" in `DepotEditor.svelte` is a bordered checkbox group with an internal scrollbar (`max-h-44`) that shows a scrollbar even with 3 farms. Replace with a typeahead multi-select built on the already-shipped `command` primitive: text input filters farms, selection renders removable chips (legacy-app pattern). The read-only preset case (creating a depot from a farm profile) stays as is.
   - Acceptance criteria:
     - Typing filters the farm list; selecting adds a chip; chips have a remove control; the checkbox box with internal scrollbar is gone.
     - Works with keyboard only (arrow keys + Enter to select, Backspace to remove last chip or an equivalent).
     - Preset-farm creation flow (from a farm profile) still shows the fixed farm name, not the picker.

8. **Auth/account dialogs: single-column, correct copy, consistent frame**
   - Description: `AuthDialog` → `TwoColumnLayout` hard-wires the onboarding title "Einträge hinzufügen und bearbeiten" + sign-up intro for every `routes/users/*` page, leaving account editing, change/forgot/reset password with irrelevant copy and a half-empty white left column. Dialog heights vary with content, and the white `Dialog.Content` around the inset cream `bg-auth-panel` column reads as a thick white border. Change: two-column onboarding layout **only** for sign-in and sign-up; editaccount, editpassword, recoverpassword, resetpassword become single-column dialogs (`max-w-md`) where the dialog surface itself is the cream panel (no white frame). Relabel the password-confirmation section in editaccount (currently "Passwort / Aktuelles Passwort", which reads like the separate change-password feature) to something like "Änderungen bestätigen".
   - Acceptance criteria:
     - editaccount, editpassword, recoverpassword, resetpassword render a single-column dialog with no onboarding intro text and no empty column; sign-in and sign-up keep the two-column layout.
     - No visible white frame around the form panel on the single-column dialogs (one background surface).
     - The four single-column dialogs share the same width and the same max-height behavior (uniform frame across pages; content scrolls inside).
     - editaccount's current-password confirmation is labeled as confirmation, not as a "Passwort" section.

9. **Remove the creation wizard**
   - Description: Farm/initiative creation is a 3-step wizard (`EntryCreationWizard.svelte`) while depot creation and all editing are single forms — three mental models. Step 1 holds only name/website/address, so the wizard doesn't earn its complexity. Decision (confirmed): creation uses the same single section-structured form as editing (Feature 4's parity form), with create-specific bits (contact-email info box) as a section. Required-field gating via disabled-until-valid save (or inline validation on submit).
   - Acceptance criteria:
     - Creating a farm or initiative presents one scrollable section form with the same section order/headings as the edit mode of Feature 4; no step indicator ("Schritt 1 von 3") remains.
     - Required-field validation prevents submission and points to the offending fields; the geocoder address flow still works.
     - `EntryCreationWizard.svelte` is removed (or reduced to the shared form wrapper).

10. **Drawer sizing: taller detail, wider editor**
    - Description: Detail mode is capped at `h-[min(70vh,36rem)]` (`SidebarShell.svelte`), forcing long profiles into a small box on large screens; editors already get near-full height but squeeze long forms into 500px (`MAP_SIDEBAR_WIDTH_PX`, `src/lib/config/layout.ts`). Decision (confirmed): detail mode gets the same near-full height as editor mode; editor mode additionally widens to ~640–720px on `lg+` (map stays visible/interactive behind for address picking).
    - Acceptance criteria:
      - Opening an entry detail on a ≥900px-tall viewport shows a drawer extending near-full height (same top/bottom insets as the editor mode).
      - Editor mode drawer is measurably wider (~640–720px) on `lg` screens; list/detail width unchanged; mobile bottom-sheet behavior unchanged.
      - Map remains visible and the address-geocoding map preview still functions in the wider editor.

11. **Select dropdown: unconstrained height breaks positioning; shadow-DOM portal support reverted**
    - Description: Two regressions introduced by the shadcn luma-theme re-scaffold (commit `45619278`, PR #831). (a) `ui/select/select-content.svelte` lost the `max-h-(--bits-select-content-available-height)` constraint that stock shadcn-svelte puts on `Select.Content`; with no max-height, a long option list (e.g. "Solawi seit (Jahr)" in the farm editor, ~100 items → measured 3664px tall vs. 848px available) cannot be placed by Floating UI and renders detached off-screen (bottom-left viewport corner). Short lists (country/region filters, month) fit and mask the bug. (b) The same commit reverted commit `605b2dec`'s shadow-DOM portal wiring: `select-portal.svelte` and `dropdown-menu-portal.svelte` no longer call `getPortalContainer()`, leaving `src/lib/utils/portal.ts` dead code — in embedded/widget mode (teikei-loader.js shadow root), portals now escape to `document.body` and lose style isolation. Fix both: restore the max-height class (and verify the viewport's `h-(--bits-select-anchor-height)` usage against the installed bits-ui 2.18.1 conventions), and re-wire `getPortalContainer()` into all portal wrappers (select, dropdown-menu, and check dialog/tooltip/command for the same need).
    - Acceptance criteria:
      - The "Solawi seit (Jahr)" dropdown in the farm editor opens anchored to its trigger, capped to the available viewport height with internal scrolling; same for every other select in the app.
      - `select-content.svelte` constrains content height via the bits-ui available-height variable (no fixed pixel cap).
      - In embedded shadow-DOM mode (embed demo page with `teikei-loader.js`), select and dropdown-menu content renders inside the shadow root portal container (`globalThis.__teikei_portal_container`), correctly styled and positioned.
      - `src/lib/utils/portal.ts` is either consumed by all portal wrappers or removed — no dead code path.

12. **Bug & polish sweep**
    - Description: Small independent defects found during the review.
    - Acceptance criteria:
      - List header renders one coherent count (e.g. "697 Einträge · 200 angezeigt"), not the collided "Einträge (697)200/697".
      - The black monospace "Zoom: 6.00" debug badge is removed from the map (or gated behind a dev flag off by default).
      - Direct URL navigation to a protected route (e.g. `#/users/editaccount`) while a valid session exists lands on that page, not on sign-in — the auth guard awaits session restore before redirecting.
      - "Verbände und Netzwerke" checkboxes in the farm editor stack vertically: one row per network with checkbox, logo, and non-wrapping label on a line (no more 4-line squeezed label).
      - `dialog-overlay.svelte` uses the `--overlay` token instead of hardcoded `bg-black/30` (or the token is changed to match the intended 30% — one source of truth).

## Technical Solution

- **Architecture:** No structural changes. All work stays inside `packages/map-next`: design tokens (`src/lib/design/theme-vars.css`, `src/routes/layout.css`), shadcn-svelte primitives (`src/lib/components/ui/*`), the domain layer (`src/lib/components/domain/*`), the drawer shell (`src/lib/components/layout/SidebarShell.svelte`, `src/routes/MapSidebar.svelte`), and auth layout (`src/lib/components/layout/AuthDialog.svelte`, `TwoColumnLayout.svelte`).
- **Technologies:** existing stack — SvelteKit (hash routing), Tailwind 4 with OKLCH tokens, shadcn-svelte/bits-ui, paraglide i18n (all label/wording changes go through `messages/*.json`, incl. de-at/de-ch/fr-ch), Playwright e2e in `packages/map-next/e2e`.
- **Key decisions:**
  - Fix at the primitive/token level wherever possible (input border, button variants, radius classes) so all call sites inherit the fix; widen `AppButton`'s variant surface rather than bypassing it.
  - Edit/read parity is achieved by routing both modes through `ProfileSection` with identical headings — the section body is the only mode-dependent part. The creation form (Feature 9) reuses this same structure, replacing the wizard.
  - Multi-select reuses the existing `command` primitive rather than adding a dependency.
  - `AuthDialog` grows a `variant: 'onboarding' | 'plain'` (or two components) instead of per-page bespoke layouts.
  - Serif removal is a deliberate product decision (confirmed 2026-07-07): editorial serif voice is dropped app-wide.
  - Feature order reflects priority: 1–4 are the highest-impact fixes; features 11–12 are independent bugfixes and can be picked up anytime (11 is user-visible and should land early).
- **Feature dependencies:** Feature 9 (wizard removal) builds on Feature 4 (parity section form). Feature 6 buttons depend on variants from Feature 1. Everything else is independent.

## Out of Scope

- `packages/map` (legacy app) — being retired, no fixes there.
- Map visual language (markers, clusters, popups) — recently done in its own feature (#852); not revisited.
- Mobile `BottomSheet` redesign — current snap-point behavior stays; features above must simply not regress it.
- New functionality beyond the reviewed surface (no new profile fields, no messaging system, no tabs).
- `client-demo` theme rework — it inherits token changes automatically; no bespoke adjustments.
- Dark mode.
- Accessibility audit beyond the contrast criteria stated in Feature 1.

## Additional Notes

- **Assumption:** screenshots/verification were desktop (1440px); each visual feature should be spot-checked at the `md` breakpoint and in the mobile bottom sheet before merge.
- **Note (Feature 11):** verifying the shadow-DOM half requires the embed path: `src/lib/preview/embed-demo.html` + `static/teikei-loader.js` expose `globalThis.__teikei_portal_container` / `__teikei_shadow_root`. Regression-test both standalone and embedded modes, and check `git show 605b2dec` for the original wiring.
- **Risk (Feature 12, guard race):** the fix touches auth/session bootstrapping; verify both directions — logged-in users reach protected routes directly, logged-out users still get redirected to sign-in with the return-to behavior intact.
- **Risk (Feature 3):** radius changes touch many snapshots/visuals at once; do it in one PR to avoid a half-migrated look.
- **Open question:** whether "Kontakt aufnehmen" should also be offered higher up on very long profiles (e.g. a small header icon) — deferred; footer CTA only for now.
