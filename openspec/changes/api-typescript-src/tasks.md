# Tasks

All commands run in `packages/api` unless noted. Each file moves with `git mv` and is typed without changing its logic (design.md: Rename and annotate, don't rewrite). After every task, `npm run typecheck`, the root `npm run lint` and `npm test` pass. The existing tests are the safety net; they change only in their import specifiers.

## 1. Setup

- [ ] 1.1 Add `src/declarations.ts` with the Feathers augmentation (`Application.jobs`, `isDevelopment()`, `isProduction()`, `HookContext.allowedFields`) and `src/types/modules.d.ts`. Install the `@types/*` dev dependencies that match the installed majors (design.md: Declarations for untyped dependencies); write local declarations for the rest when the first file that imports them is converted. Verify that `npm run typecheck` passes and `npm ls` shows the new packages under `devDependencies`.

## 2. Leaf modules

- [ ] 2.1 Convert `utils/errorCodes`, `utils/maskSensitive` and `logger` (with a type for the serialized error), and update their importers. Verify that `logger.test.js` and the error-code tests pass.
- [ ] 2.2 Convert `middleware/{index,cors,errorHandler,rateLimit}` and `db`. Verify that `cors.test.js` and `rateLimit.test.js` pass.
- [ ] 2.3 Convert `domain/validation/*` and switch the domains' `./validation/index.js` imports to `.ts`. Verify that the farms, depots, initiatives and users tests pass.

## 3. Hooks

- [ ] 3.1 Convert `hooks/{audit,logError,refreshSearchIndex,verify,userAccountActions}`. Verify that `serviceErrorCodes.test.js` and `authentication.test.js` pass.
- [ ] 3.2 Convert `hooks/{filterAllowedFields,geoJson,user,email}` and replace their lodash calls with built-ins, keeping the in-place deletion in `filterAllowedFields`. Verify that the farms, depots, initiatives, users and entries tests pass, including their GeoJSON and field-filtering assertions.

## 4. Authorization

- [ ] 4.1 Convert `permissions` with the exported `Scope` and `Role` types, typing the role map as `Record<Role, Scope[]>` and `resource` as the shape each condition reads (design.md: One `Scope` type for authorization). Verify that `npm run typecheck` passes with no casts in `permissions.ts`.
- [ ] 4.2 Convert `hooks/authorization` on top of `Scope`, decode the JWT with a typed payload, and replace its lodash calls. Verify that `serviceErrorCodes.test.js`, `httpErrorCodes.test.js` and the users and entries service tests pass (403s and forbidden-field codes unchanged).
- [ ] 4.3 Add every bug that typing revealed in groups 2 to 4 to `## Findings` below, without fixing it (for example, the admin create conditions that throw because a create has no resource). Verify that the section exists, saying "none" if nothing was found.

## 5. Services

- [ ] 5.1 Convert `services/{authentication,authManagement,userReactivation}`. Fix the not-callable `authManagement(...)` import by its type only, and replace the lodash `omit`. Verify that `authentication.test.js`, `authManagement.test.js` and `authManagementErrorCodes.test.js` pass.
- [ ] 5.2 Convert `services/{emails,emailPreview,entryContactMessage}`, including the not-callable imports in `emails` and the `readFileSync` encoding (design.md). Verify that `emails.test.js` passes and that `npm run dev` (repo root) logs "Email templates compiled successfully." and serves `/emailPreview` in development.
- [ ] 5.3 Convert `services/{geocoder,reverseGeocoder,autocomplete,searchIndex,status}` and replace the lodash `compact`. Verify that `autocomplete.test.js` passes and that `GET /status` answers as before.
- [ ] 5.4 Convert `services/admin/{jobs,bounces,userAccountStateChange}`. Verify that `adminUsers.test.ts` and `jobs.test.js` pass.
- [ ] 5.5 Add any bugs found in this group to `## Findings`. Verify that the section is up to date.

## 6. Jobs

- [ ] 6.1 Convert `jobs/*`, including `index` with the typed `app.jobs` registry. Verify that `jobs.test.js` and `emailCampaignJobs.test.ts` pass and that `GET /admin/jobs` as a superadmin lists the jobs with their next invocation.

## 7. App and entry point

- [ ] 7.1 Convert `app`, `services/index` and `index`. Point the `start`, `dev` and `dev-debug` scripts at `src/index.ts`. Fix the not-callable `express(feathers())` by its type only. Verify that:
  - `npm start` boots and serves `/farms`
  - `npm run dev` (repo root) reloads on a source change
  - `find src -name '*.js' -not -path '*/__test__/*'` prints nothing
- [ ] 7.2 Move `lodash` to `devDependencies` with npm, so the root lockfile is updated. Verify that `grep -rn "from 'lodash'" src` finds only `__test__` files.

## 8. Guard and docs

- [ ] 8.1 Add the `eslint.config.js` block that rejects `.js` files in `packages/api/src` outside `__test__` (design.md: Guard against new JavaScript). Verify that the root `npm run lint` passes, and fails on a temporary `src/tmp.js`, which you then delete.
- [ ] 8.2 Update `AGENTS.md`: state in the `packages/api` rules that `src` is TypeScript apart from tests, and rename the known exceptions to `services/searchIndex.ts`, `services/autocomplete.ts` and `hooks/email.ts`. Verify that `grep -n "\.js" AGENTS.md` shows no `packages/api/src` file.

## 9. Integration check

- [ ] 9.1 Run `npm run typecheck`, the root `npm run lint`, `npm test`, and the embed integration tests (`embed-integration-tests.yml` locally or in CI). Verify that all pass, and that `grep -rn "@ts-ignore\|@ts-expect-error" src` finds nothing.
- [ ] 9.2 Deploy to preview and check startup logs, login, an entry edit and `/admin/jobs`. Verify that there are no errors before production.

## Findings

<!-- Bugs revealed by typing, fixed in a separate change. -->

## Workflow follow-up

- Archive the change after review and the production deploy.
