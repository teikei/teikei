# Implementation Plan: Admin Package Improvements

Spec: specs/admin-package-improvements/spec.md

Status legend: [ ] todo · [~] in progress · [x] done
Model legend: recommended implementer model per feature, by complexity/risk — Claude Sonnet (well-scoped, pattern-following) · Claude Opus (multi-component, stateful/integration complexity or investigation needed) · Claude Fable (architectural or destructive/data-integrity risk)

- [ ] 1. Fix dead permission checks in email lists (depends on: none · model: Claude Sonnet)
  - [ ] 1.1 Replace the `const { permissions } = props` pattern with the `usePermissions()` hook in `EmailCampaignsList` and `EmailMessagesList` (`src/resources/emailCampaigns.jsx`, `src/resources/emailMessages.jsx`)
  - [ ] 1.2 Verify against a local API: superadmin sees working Delete buttons in both lists, plain admin does not; `grep` confirms no list component reads `permissions` from props

- [ ] 2. Fix sidebar menu collapse styling in AppMenu (depends on: none · model: Claude Sonnet)
  - [ ] 2.1 In `src/components/AppMenu.jsx`, read the sidebar state via react-admin's `useSidebarState()` and remove the undefined-`open` classnames logic and the `lodash` import
  - [ ] 2.2 Replace `makeStyles`/`classnames` in `AppMenu.jsx` with `sx`/`styled` (drop the `classnames` import if no longer needed anywhere)
  - [ ] 2.3 Verify the sidebar toggle switches the menu between 240px (open) and 55px (closed) width

- [ ] 3. Fix role-conditional section and role id handling in the user form (depends on: none · model: Claude Opus)
  - [ ] 3.1 Add named role id constants (`ROLE_USER`, `ROLE_ADMIN`, `ROLE_SUPERADMIN`) to `src/lib/enumerations.js`
  - [ ] 3.2 In `src/components/UserFormUserTab.jsx`, guard `roles` being undefined and fix the integer-vs-string comparison (normalize with `.map(String)` or compare numerically); first verify the actual runtime type with a real record
  - [ ] 3.3 Replace the hardcoded `'roles.id': '1'/'2'/'3'` values in `src/resources/users.jsx` quick filters with the new constants
  - [ ] 3.4 Verify: editing an admin/superadmin user shows the adminOrigins select and "Receive Admin Emails" toggle, a plain user hides them, and toggling roles in the form shows/hides the section without a crash

- [ ] 4. Fix UsersEdit transform and make transforms non-mutating (depends on: none · model: Claude Sonnet)
  - [ ] 4.1 In `src/resources/users.jsx`, fix the `UsersEdit` transform to strip `roles` and `adminOrigins` (not `origins`) via rest/spread instead of `delete`
  - [ ] 4.2 In `src/resources/emailCampaigns.jsx`, make the `EmailCampaignsCreate` transform (`testEmailUser` removal) non-mutating

- [ ] 5. Robust auth provider: logout on 401, safe getPermissions, own module (depends on: none · model: Claude Opus)
  - [ ] 5.1 Create `src/authProvider.js`: move the provider out of `App.jsx`, implement `checkError` rejecting on 401/403 responses, and guard `getPermissions` against a missing/undecodable JWT (clean rejection, no synchronous throw)
  - [ ] 5.2 Move `useStatus` from `App.jsx` to `src/hooks/useStatus.js` and update imports in `jobs.jsx`, `emailCampaigns.jsx`, `emailMessages.jsx`; confirm no module imports from `../App` anymore
  - [ ] 5.3 Verify: with a garbage `feathers-jwt` in localStorage, opening any list redirects to login; with no token, `getPermissions` rejects without an uncaught exception

- [ ] 6. Single, cached, typed status/feature-flag handling (depends on: 5 · model: Claude Sonnet)
  - [ ] 6.1 Rework `src/hooks/useStatus.js`: fetch `/status` once per session (cached), normalize feature flags to booleans, treat fetch failure as all-features-disabled without unhandled rejections
  - [ ] 6.2 Update consumers (`jobs.jsx`, `emailCampaigns.jsx`, `emailMessages.jsx`) to test boolean flags, and fix the `hasCreate` flash in `EmailCampaignsList` while status is loading
  - [ ] 6.3 Verify in devtools: at most one `/status` request when navigating between Jobs, Email Campaigns, and Email Messages; lists render with the API stopped

- [ ] 7. Remove dead code, CRA leftovers, and dependency hygiene (depends on: 2 · model: Claude Sonnet)
  - [ ] 7.1 Delete `src/components/DocsPage.jsx`, `src/components/EntriesChart.jsx`, `src/App.css`, and `src/logo.svg` (confirm unused first); delete the passthrough `src/components/Pagination.jsx` or give it real defaults, updating all imports
  - [ ] 7.2 Clean `package.json`: move `@vitejs/plugin-react-swc` to devDependencies, remove `@vitejs/plugin-react-refresh`, remove `recharts`/`date-fns`/`prop-types`/`classnames` if unused after 7.1, confirm `lodash` is neither used nor declared
  - [ ] 7.3 Clean `index.html` (stale CRA comments, dead `logo192.png` apple-touch-icon) and fix `public/manifest.json` icon references
  - [ ] 7.4 Replace `App.test.jsx`/`setupTests.js` with a vitest setup and one real smoke test (render the login page); wire `npm test` to vitest
  - [ ] 7.5 Run `npm run build` and `npx depcheck`; fix any leftover references or unused/undeclared dependencies

- [ ] 8. Deduplicate lists/forms and set input defaults at the theme level (depends on: 2 · model: Claude Fable)
  - [ ] 8.1 Add `components.defaultProps` to `src/theme.js` so text/select/number/boolean/date inputs default to `variant='standard'` and no margin; strip the now-redundant `variant`/`margin` props across `src/resources/` and `src/components/` (target: zero occurrences)
  - [ ] 8.2 Extract `FormToolbar` (Cancel + Save, unified `variant='filled'` Cancel), `AdminFormSection` (active/ownerships/createdAt/updatedAt column), and `AddressFormSection` (address/housenumber/postalcode/city/state/country rows) and use them in `FarmForm`, `DepotForm`, `InitiativeForm`
  - [ ] 8.3 Extract the shared farms/depots/initiatives datagrid (id, name, city, state, country, createdAt, updatedAt, active, edit/delete) into a common component used by all three lists
  - [ ] 8.4 Merge `UserCountCard` and `EntryCountCard` into one `StatCard` (add `img` alt text, remove the phantom `classes.card` reference)
  - [ ] 8.5 Replace `TwoElementRow`'s double-margin flexbox with MUI `Stack`/`Grid` spacing (keep the `ratio` prop behavior)
  - [ ] 8.6 Migrate the remaining `makeStyles` usages (`Dashboard.jsx`, `AppBar.jsx`, `StatCard`) to `sx`/`styled`; remove `@mui/styles` from `package.json` and from the `.ncurc.js` reject list
  - [ ] 8.7 Visual spot-check all six edit forms and all list filter bars against the pre-change rendering

- [ ] 9. Idiomatic, consistent filters (depends on: 3, 8 · model: Claude Opus)
  - [ ] 9.1 Convert every list from the legacy `<Filter>` wrapper element to react-admin 5 `filters={[...]}` input arrays (farms, depots, initiatives, users, emailMessages)
  - [ ] 9.2 Try replacing the forked `src/components/FilterLiveSearch.jsx` with react-admin's exported `FilterLiveSearch`; if a concrete gap remains after Feature 8's theme defaults, keep the fork with an in-code comment documenting the gap
  - [ ] 9.3 Extract shared `CountryFilterList` (DEU/CHE/AUT) and `ActiveFilterList` (Yes/No) sidebar components and use them in the farms/depots/initiatives sidebars
  - [ ] 9.4 Unify badge filter value types to numbers in `farms.jsx` (toolbar select and sidebar items), centralize badge ids/labels (constants or loaded from `admin/badges`), and fix `toggleBadgeFilter` mutating its `filters` argument
  - [ ] 9.5 In `users.jsx`, render the static filters immediately and gate only the origin `SelectInput` on the origins fetch
  - [ ] 9.6 Verify: toolbar and sidebar badge filters stay in sync (same value type), users list shows its filter toolbar instantly, country/active sections come from the shared components

- [ ] 10. Fix admin-role user edit end to end (API field-permission mismatch) (depends on: none · model: Claude Opus)
  - [ ] 10.1 Reproduce against a local API: as a non-superadmin admin, toggle "Receive Admin Emails" on a user and confirm the PATCH returns 403 due to the snake_case `admin_email_notifications` field allowlist
  - [ ] 10.2 Fix the field list in `packages/api/src/permissions.js` (admin scope for `admin/users:update`) to match the camelCase key the client sends
  - [ ] 10.3 Add an API test: admin can patch `name`/`email`/`phone`/`adminEmailNotifications`, still gets 403 when patching `roles`

- [ ] 11. Dashboard robustness (depends on: none · model: Claude Sonnet)
  - [ ] 11.1 Rework `src/components/Dashboard.jsx` data fetching: handle the response shape explicitly (`.data` or raw array), use `null` initial state with loading placeholders, catch errors and surface them via `useNotify`, and skip fetching when the user lacks the admin role
  - [ ] 11.2 Make `findCountInStats` return a fallback (0/`'–'`) for unknown resources/states instead of throwing
  - [ ] 11.3 Verify: dashboard counts match the filtered lists; with the API stopped, an error notification appears and no unhandled rejection is logged

- [ ] 12. Jobs list hardening and RPC-button cleanup (depends on: none · model: Claude Sonnet)
  - [ ] 12.1 In `src/resources/jobs.jsx`, wrap the cron explanation in a guarded helper (try/catch, fall back to the raw string) and guard `useRecordContext()` destructures there plus in `bounces.jsx` (`EditUserButton`) and `UserForm.jsx` (`EntryEditButton`)
  - [ ] 12.2 Fix the jobs Datagrid sorting: remove the invalid `sort={false}` prop and mark each column `sortable={false}`
  - [ ] 12.3 In `SendCampaignButton.jsx`, `UserStateChangeButton.jsx`, and the jobs `RunButton`: remove the `useEffect(() => refresh(), [isLoading])` pattern, use `onSuccess`/`onError` callbacks with `useNotify` for error surfacing, and refresh exactly once on success
  - [ ] 12.4 Verify: a job row with an invalid cron string renders instead of crashing (unit test the helper), jobs column headers are not sortable, failed send/run/state-change calls show an error notification

- [ ] 13. UI consistency & theming polish (depends on: 2 · model: Claude Sonnet)
  - [ ] 13.1 Move hardcoded colors into the theme: `#266050` in `AppBar.jsx` → `palette.secondary.main`, link color and `#fffcf9` card background in `EmailCampaignForm.jsx` → palette values; delete the commented-out "API Docs" block in `AppBar.jsx`
  - [ ] 13.2 Give each resource a distinct MUI icon via the `<Resource icon>` prop in `App.jsx` and use them in `AppMenu.jsx` instead of the shared `ViewList` icon
  - [ ] 13.3 Label the login identifier field "Email" (custom login page or i18n message override)
  - [ ] 13.4 Switch list `DeleteButton`s (farms, depots, initiatives, users, email lists) to `mutationMode='pessimistic'` so destructive deletes require confirmation
  - [ ] 13.5 Normalize label casing across datagrid headers and sidebar quick-filter labels (e.g. `id` → `Id`/`ID`, consistent `Verified` naming)
  - [ ] 13.6 Rename the `FarmsFilterSidebar` component inside `src/components/FilterSidebar.jsx` to `FilterSidebar`, and move the email-messages pagination limitation comment onto the Pagination props in `emailMessages.jsx`
