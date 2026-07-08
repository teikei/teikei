# Spec: Admin Package Improvements

## Problem Statement

`packages/admin` is the react-admin based administration UI for Ernte Teilen. It was
bootstrapped with Create React App years ago, later moved to Vite, and upgraded to
react-admin 5 — but much of the code still follows react-admin 3/CRA-era patterns.
A code audit (2026-07-08) found confirmed bugs (dead permission checks, a broken
sidebar-collapse class, a wrong transform key), security/auth hygiene gaps
(`checkError` never logs out on 401), heavy duplication (167 repetitions of
`variant='standard'`, three nearly identical entry forms/lists/filter sidebars),
dead CRA leftovers, and UI inconsistencies.

This spec captures the audit findings as implementable features so the admin UI
becomes correct, consistent, and cheap to maintain. The API (`packages/api`) enforces
authorization centrally via a permission matrix (`src/permissions.js` + `authorize`
hook), so all client-side role gating is cosmetic UX — this spec does not change the
security model, it fixes the client's correctness and hygiene around it.

Verified environment facts (checked against installed packages, do not re-litigate):

- react-admin 5.14.7. `Resource` renders `list`/`edit` elements with **no props**
  (`ra-core/dist/core/Resource.js`), so `props.permissions` inside list components is
  always `undefined`.
- The dashboard **does** receive a `permissions` prop (rendered via `WithPermissions`).
- The legacy function-style `ra-data-feathers` provider is still supported via
  `convertLegacyDataProvider`.
- `dataProvider.getList` returns `{ data, total }`; the Dashboard's `stats.find(...)`
  only works by accident because `admin/stats` returns a raw array that
  `ra-data-feathers` mutates in place (adds `.data`/`.total` onto the array).
- API `admin` role may PATCH `admin/users` fields `['name', 'email', 'phone',
'admin_email_notifications']` (note: snake_case, while the client sends camelCase
  `adminEmailNotifications` — see Feature 10).

## Features

1. **Fix dead permission checks in email lists**
   - Description: `EmailCampaignsList` and `EmailMessagesList` read
     `const { permissions } = props`, which is always `undefined` in react-admin 5,
     so their `DeleteButton`s never render even for superadmins. Use the
     `usePermissions()` hook like the other lists do.
   - Acceptance criteria:
     - Logged in as superadmin, the Email Campaigns and Email Messages datagrids show
       a working Delete button per row.
     - Logged in as a plain admin, no Delete button is shown in these lists.
     - No list component reads `permissions` from props anywhere in the package.

2. **Fix sidebar menu collapse styling in `AppMenu`**
   - Description: `AppMenu.jsx` computes `{ [classes.open]: open, [classes.closed]: !open }`
     but `open` is never defined — it resolves to the global `window.open` function
     (always truthy), so the menu is permanently styled "open" and the collapsed state
     never applies its narrow width. Use react-admin's `useSidebarState()` for the
     actual state. While here, drop the `lodash` import (`_.get` over two local
     constants; lodash is not even declared in `package.json` — it only resolves via
     hoisting) and migrate the `makeStyles` usage to `sx`/`styled` (see Feature 8).
   - Acceptance criteria:
     - Toggling the sidebar (hamburger) visibly switches the menu between
       `MENU_WIDTH` (240px) and `CLOSED_MENU_WIDTH` (55px).
     - `lodash` is no longer imported anywhere in `packages/admin/src`.
     - No reference to an undefined `open` variable remains (verify with lint).

3. **Fix role-conditional section and role id handling in the user form**
   - Description: `UserFormUserTab.jsx` shows the admin-origins/notifications section
     when `roles.includes('2') || roles.includes('3')`. The API maps the `roles`
     relation to an array of **integer** ids (`mapResultRelationsToIds`), so the
     string comparison likely never matches and the section never renders for
     admin/superadmin users (verify at implementation with a real record; fix the
     comparison either way, e.g. compare loosely or normalize with `.map(String)`).
     `roles` can also be `undefined` before the record loads → guard it. Role ids
     `1/2/3` are magic numbers duplicated here and in `users.jsx` (roles quick
     filter) — centralize them in `src/lib/enumerations.js` with named constants
     (`ROLE_USER = 1`, `ROLE_ADMIN = 2`, `ROLE_SUPERADMIN = 3`).
   - Acceptance criteria:
     - Editing a user who has the admin or superadmin role shows the "adminOrigins"
       select and "Receive Admin Emails" toggle; editing a plain user hides them.
     - Toggling roles in the form immediately shows/hides that section without a crash.
     - Role ids appear exactly once in the codebase (enumerations module); `users.jsx`
       and `UserFormUserTab.jsx` consume the constants.

4. **Fix `UsersEdit` transform and make transforms non-mutating**
   - Description: `UsersEdit`'s transform deletes `data.roles` and `data.origins` for
     non-superadmins, but the form field is `adminOrigins` — `data.origins` doesn't
     exist, so `adminOrigins` would be submitted if it ever changed. Delete the right
     key. Also return a new object instead of mutating the react-admin `data`
     argument (same for the `EmailCampaignsCreate` transform which deletes
     `testEmailUser`).
   - Acceptance criteria:
     - The transform strips `roles` and `adminOrigins` (not `origins`) when the editor
       lacks the superadmin role.
     - Transforms in `users.jsx` and `emailCampaigns.jsx` build new objects (rest/spread)
       rather than `delete` on the input.

5. **Robust auth provider: logout on 401, safe `getPermissions`, own module**
   - Description: the `authProvider` in `App.jsx` has `checkError: () => Promise.resolve()`,
     so an expired/invalid JWT never redirects to login — every request just keeps
     failing with error notifications. Implement the react-admin contract: reject on
     401/403 responses so the user is logged out and redirected. `getPermissions`
     calls `jwtDecode(localStorage.getItem('feathers-jwt'))` unguarded — a missing
     token throws synchronously (jwt-decode v4 throws on non-string), and the
     `roles ? ... : Promise.reject(...)` check after `.map()` is unreachable. Guard
     missing/undecodable tokens by rejecting cleanly. Move `authProvider` (and
     `useStatus`, see Feature 6) out of `App.jsx` into dedicated modules
     (`src/authProvider.js`, `src/hooks/useStatus.js`) — resources currently import
     `useStatus` from `../App` while `App` imports the resources (circular import).
   - Acceptance criteria:
     - With an expired/garbage `feathers-jwt` in localStorage, opening any list
       redirects to the login screen instead of showing endless failing requests.
     - With no token present, `getPermissions` rejects (no uncaught synchronous throw;
       verify via unit test or manual localStorage clear while on a page).
     - `App.jsx` no longer defines `authProvider` or `useStatus`; no module imports
       from `../App`.

6. **Single, cached, typed status/feature-flag handling**
   - Description: `useStatus()` fires a fresh unauthenticated-error-prone
     `status.find()` on every mount of every component that uses it (jobs list, both
     email lists), has no error handling, and every consumer string-compares
     `feature === 'true'`. Fetch the status once (react-query via react-admin's
     `useQuery`-style hooks or module-level cache), normalize flags to booleans in one
     place, and handle fetch failure (treat features as disabled). Also fix the
     UX flash in `EmailCampaignsList` where `hasCreate` is false during the fetch.
   - Acceptance criteria:
     - Navigating between Jobs / Email Campaigns / Email Messages triggers at most one
       `/status` request per session (verify in devtools network tab).
     - Consumers test booleans (`features.emailCampaigns`), not `=== 'true'`.
     - If `/status` fails, the lists still render (feature-gated buttons hidden) and no
       unhandled promise rejection appears in the console.

7. **Remove dead code, CRA leftovers, and dependency hygiene**
   - Description: delete `src/components/DocsPage.jsx` (unreferenced; uses webpack
     `!babel-loader!` import syntax that cannot work under Vite and points to a
     non-existent `content/apidocs.mdx`), `src/components/EntriesChart.jsx`
     (unreferenced; ~70 lines commented out) — recharts and date-fns become removable
     dependencies if nothing else uses them, `src/App.css` (unimported CRA logo-spinner
     styles), `src/logo.svg` if unused, and `src/components/Pagination.jsx` (pure
     passthrough — either delete and use `<Pagination>` from react-admin directly, or
     give it real defaults like `rowsPerPageOptions`). Replace `App.test.jsx` (asserts
     a CRA "learn react link" that doesn't exist and never runs — the `test` script is
     `echo 'noop'`) with a minimal real smoke test wired to `vitest` (deps are already
     present via testing-library), or delete it together with `setupTests.js` if the
     team decides against tests. Clean `index.html` (stale CRA comments, dead
     `logo192.png` apple-touch-icon reference) and `public/manifest.json` icon
     references. Package.json: move `@vitejs/plugin-react-swc` to devDependencies,
     remove obsolete `@vitejs/plugin-react-refresh`, remove `prop-types`/`classnames`
     if unused after Feature 2, declare or (preferably) drop `lodash`.
   - Acceptance criteria:
     - `npm run build` succeeds after removals; `grep` finds no references to the
       deleted files.
     - `npm test` either runs a passing vitest suite or the script and test scaffolding
       are removed entirely (team choice; default: add vitest smoke test that renders
       the login page).
     - No dependency in `package.json` is unused, and nothing imported is undeclared
       (verify with `npx depcheck` or equivalent).

8. **Deduplicate lists/forms and set input defaults at the theme level**
   - Description: `variant='standard'` appears 167× and `margin='none'` 159× — set
     these once in `theme.js` via MUI/react-admin `components.defaultProps`
     (e.g. `MuiTextField`, `RaSelectInput`, etc.) and strip the per-input props.
     Extract the shared structures:
     - Farms/Depots/Initiatives lists are identical except columns/forms → shared
       datagrid column set or a common `EntryList` wrapper.
     - The three entry forms repeat the same address block (`address`/`housenumber`/
       `postalcode`/`city`/`state`/`country`), the same right-hand "Admin" column
       (`active`, `ownerships`, `createdAt`, `updatedAt`) and the same Cancel/Save
       toolbar → extract `AddressFormSection`, `AdminFormSection`, `FormToolbar`
       (one component; note today `FarmForm`'s Cancel lacks the `variant='filled'`
       the others have — unify).
     - `UserCountCard` and `EntryCountCard` are near-identical → one `StatCard`
       (fixes the missing `img alt` too). `classes.card` referenced in both does not
       exist in their `useStyles` — remove.
     - `TwoElementRow` applies `marginRight` to both columns (asymmetric trailing
       margin) → use MUI `Stack`/`Grid` spacing.
     - Migrate remaining `makeStyles` (`@mui/styles`, deprecated legacy engine that
       currently blocks MUI upgrades — see `.ncurc.js` reject list) to `sx`/`styled`,
       then remove `@mui/styles` from dependencies and from the `.ncurc.js` rejects.
   - Acceptance criteria:
     - `grep -c "variant='standard'"` over `src` returns 0 (theme default covers it);
       forms and filters render visually unchanged (spot-check farms edit, user edit,
       users list filters).
     - `@mui/styles` and `makeStyles` are gone from source and `package.json`.
     - Farms/Depots/Initiatives forms share the address, admin-column, and toolbar
       components; total package LOC drops measurably (expect >400 lines).

9. **Idiomatic, consistent filters**
   - Description: all lists use the legacy `<Filter>` wrapper element; react-admin 5's
     idiom is passing an **array of inputs** as `filters`. Convert, and while doing so:
     - Replace the forked `src/components/FilterLiveSearch.jsx` (copied react-admin
       internals) with react-admin's exported `FilterLiveSearch` if it supports the
       needed props after Feature 8's theme defaults; keep the fork only if a concrete
       gap is documented in-code.
     - Dedupe the country (`DEU`/`CHE`/`AUT`) and Active Yes/No `FilterList` blocks
       repeated across farms/depots/initiatives sidebars into shared components.
     - Unify badge filter value types: the farms toolbar filter uses string ids
       (`'1'`/`'2'`) while the sidebar uses numbers (`1`/`2`), so the two UIs disagree
       about whether the same filter is active. Pick one type (number) and use the
       badge-name constants from Feature 3's enumerations approach; badge ids/names
       (`1` = Netzwerk solidarische Landwirtschaft e.V., `2` = FRACP) are currently
       hardcoded in two shapes in `farms.jsx` — ideally load badge choices from
       `admin/badges` like the forms do.
     - `users.jsx` `UserFilter` renders `null` until origins load, hiding _all_
       filters and the filter button; render the static filters immediately and only
       gate the origin select.
     - Fix `toggleBadgeFilter` in `farms.jsx` mutating the `filters` object it receives.
   - Acceptance criteria:
     - No `<Filter>` element usage remains; all lists pass `filters={[...]}` arrays.
     - Selecting "Member" of a badge via the toolbar filter shows the sidebar item as
       selected and vice versa (same value type end to end).
     - Users list shows its filter toolbar instantly on first load (origins select may
       appear when loaded).
     - Country/Active sidebar sections are rendered by shared components.

10. **Fix admin-role user edit end to end (client + API field-permission mismatch)**
    - Description: the API allows the `admin` role to patch
      `admin_email_notifications` (snake_case) on `admin/users`, but the client sends
      `adminEmailNotifications` (camelCase) — so a plain admin toggling "Receive Admin
      Emails" gets a 403 `Forbidden` from the `authorize` hook's field check
      (`packages/api/src/permissions.js`, admin scope). Verify against a running API
      and fix the field list server-side (camelCase, matching what Objection receives
      in `ctx.data`) or map client-side — server fix preferred; it's a one-word change.
    - Acceptance criteria:
      - Logged in as a non-superadmin admin, toggling "Receive Admin Emails" on a user
        and saving succeeds (no 403) and persists after reload.
      - Patching a forbidden field (e.g. `roles`) as plain admin still returns 403
        (regression check, covered by an API test).

11. **Dashboard robustness**
    - Description: `Dashboard.jsx` treats `dataProvider.getList('admin/stats', {})`
      as an array (works only by accident, see verified facts), initializes numeric
      counts with `useState([])`, has no error handling (a failed fetch is an
      unhandled rejection and the cards silently stay empty), and `findCountInStats`
      throws if a resource is missing. Rework: call the stats service once, read
      `.data`, type-sensible initial state (`null` → show loading/placeholder), catch
      errors and notify (`useNotify`), and guard missing resources/states. Keep the
      accidental-array behavior working until the API's stats service is (optionally)
      changed to return a paginated shape — do not require an API change here.
    - Acceptance criteria:
      - Dashboard renders correct counts for entries and user states (compare with the
        respective filtered lists).
      - With the API stopped, the dashboard shows an error notification and empty-state
        placeholders instead of a console unhandled-rejection.
      - `findCountInStats` returns a fallback (0/`'–'`) for unknown resources/states
        instead of throwing.

12. **Jobs list hardening and RPC-button cleanup**
    - Description: in `jobs.jsx`, `CronExplanation` calls `cronstrue.toString(cron)`
      unguarded — one malformed cron string in the DB crashes the whole list; wrap in
      try/catch and fall back to the raw string. `useRecordContext(props)` can return
      `undefined` — guard destructuring (also in `bounces.jsx` `EditUserButton` and
      `UserForm`'s `EntryEditButton`). `Datagrid sort={false}` is not a react-admin
      prop (columns must be `sortable={false}` individually, as `bounces.jsx` does) —
      fix so clicking headers doesn't issue sort queries the custom jobs service
      ignores. In `SendCampaignButton` and `UserStateChangeButton`, remove the
      `useEffect(() => refresh(), [isLoading])` pattern (fires a spurious refresh on
      mount and duplicates the explicit `refresh()` in the confirm handlers); rely on
      `useUpdate`/`useCreate` callbacks (`onSuccess`) plus a single refresh, and
      surface errors via `useNotify` (currently a failed job-run/campaign-send/state
      change shows a success-looking silence).
    - Acceptance criteria:
      - A job row with an invalid cron string renders (raw string shown) instead of
        crashing the list (unit-testable on the extracted explanation helper).
      - Job list column headers are not clickable for sorting.
      - Failed send-campaign / run-job / activate-deactivate calls show an error
        notification; successful ones refresh the view exactly once.

13. **UI consistency & theming polish**
    - Description: assorted visual/UX inconsistencies:
      - Hardcoded colors: `#266050` in `AppBar.jsx` (duplicates `theme.palette.secondary.main`),
        link color `#266050` and card background `#fffcf9` in `EmailCampaignForm.jsx` —
        use theme palette; delete the commented-out "API Docs" link block in `AppBar`.
      - Every menu entry uses the same `ViewList` icon — pick distinct MUI icons per
        resource (farms/depots/initiatives/users/bounces/etc.) and pass them to the
        `<Resource icon>` prop so react-admin uses them consistently.
      - Login form asks for "Username" but expects an email — provide a custom login
        page or i18n override labeling it "Email".
      - `DeleteButton`s in lists are undoable by default; for destructive admin ops on
        real user data prefer `mutationMode='pessimistic'` with confirm dialog
        (consistent with the Confirm dialogs used for campaign send / user deactivate).
      - Datagrid header casing is inconsistent (`Verified` label vs auto-generated
        `Is verified` elsewhere; sidebar quick-filter labels are lowercase `id`,
        `name`, …) — normalize casing on labels.
      - `FilterSidebar.jsx`'s component is named `FarmsFilterSidebar` though it is
        generic — rename to `FilterSidebar`; replace magic `mt: 8` with a documented
        constant if still needed after testing.
      - Email messages list: `rowsPerPageOptions={[5, 10]}` is a workaround for an API
        reference-batching limit (see in-code comment) — keep, but move the comment to
        the Pagination props so it survives refactors.
    - Acceptance criteria:
      - `grep -rn "#266050\|#fffcf9" src` returns only `theme.js` (or nothing).
      - Each menu entry/resource shows a distinct icon in the sidebar.
      - Login screen labels the identifier field "Email".
      - Deleting a farm/depot/initiative/user asks for confirmation before issuing the
        request (no optimistic delete), and list labels use consistent casing.

## Technical Solution

- Architecture: pure refactor/bugfix of the existing react-admin 5 + Vite SPA. No new
  routes or services. One deliberate cross-package touch: Feature 10's one-line
  permission-field fix in `packages/api/src/permissions.js` plus an API test.
- Technologies: keep react-admin 5.x, MUI 6, Vite 7, `ra-data-feathers` +
  `feathers-client` v2 (replacing the legacy feathers client is explicitly out of
  scope). Add `vitest` as the test runner (Feature 7) reusing the existing
  testing-library devDependencies.
- Key decisions:
  - Client-side role gating remains cosmetic; the API permission matrix is the
    security boundary (verified: `authorize` hook + `permissions.js` cover all
    `/admin/*` services with scope, condition, and field checks).
  - Theme-level `defaultProps` is the mechanism to kill the `variant`/`margin` prop
    noise, rather than a custom wrapped-input component library.
  - Enumerations (role ids, badge ids, user states) live in `src/lib/enumerations.js`
    as the single source for magic ids the API exposes as integers.
  - Ordering: Features 1–5 are independent bugfixes and can be implemented in any
    order; Feature 8 (theme defaults) should land before Feature 9 (filters) to avoid
    churn; Feature 7 (dead code) early to shrink the surface for the rest.

## Out of Scope

- Replacing `feathers-client` v2 / `ra-data-feathers` with `@feathersjs/client` v5 or
  a custom data provider (large, risky; the legacy provider is still supported by
  react-admin 5 via `convertLegacyDataProvider`).
- Adding create views for farms/depots/initiatives/users (entries are created through
  the map application; admin only edits).
- i18n / full German-English translation cleanup of labels beyond the login field.
- Moving the JWT out of localStorage or other auth-architecture changes (the committed
  JWT secret rotation is a separate ops task, tracked outside any PR).
- API stats service reshaping to a paginated response (Feature 11 must work without it).
- Any changes to `packages/map` (legacy, being retired) or `packages/map-next`.

## Additional Notes

- Verify-at-implementation items (called out inline above): the integer-vs-string
  `roles` comparison in Feature 3, the camelCase/snake_case 403 in Feature 10, and
  whether react-admin's built-in `FilterLiveSearch` can replace the fork in Feature 9.
- There is no CI test coverage for this package today (`test` script is a noop), so
  every feature's acceptance relies on `npm run build` plus manual verification
  against a locally running API; Feature 7 introduces the first real test entry point.
- `.ncurc.js` currently rejects all `@mui/*` upgrades because of the deprecated
  `@mui/styles` engine; Feature 8 removes that blocker — consider a follow-up
  dependency-update pass afterwards.
- Risk note: Feature 8's theme `defaultProps` change touches every input's visual
  rendering; do a side-by-side visual pass of all six edit forms and all list filter
  bars before merging.
