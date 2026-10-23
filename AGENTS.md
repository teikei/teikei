# Repository Guidelines

## Project Structure & Module Organization

- Root uses npm workspaces plus Lerna; shared tooling lives in `package.json`, `scripts/`, and `eslint.config.js`.
- API resides in `packages/api` (Feathers/Express) with migrations in `db/` and job/email helpers in `scripts/`.
- Frontend apps:
  - legacy map in `packages/map` (React/Vite) with feature code in `src/`, assets in `public/`, webtests in `src/webtests`; This app serves as a reference for the rewrite but must not be updated, except when explicity told to do so eg in the case of necessary production hotfixes.
  - admin in `packages/admin` (React Admin) with resources under `src/`. This is the admin panel for content moderation, a separate React app built with react-admin.
  - new svelte frontend rewrite in `packages/embed`. This is the new frontend application that is currently being developed. It is using Svelte, Sveltekit and shadcn-svelte.

## Build, Test, and Development Commands

- `npm install` bootstraps all workspaces; rerun after dependency updates.
- `npm run dev` starts Dockerized Postgres, the API, and the map (packages/embed)
- `npm run dev:admin` starts the admin UI.
- `npm run dev:legacy` starts Dockerized Postgres, the API, and the legacy map (packages/map)
- `npm run build` runs each package build (`vite build`) for production bundles. `packages/api` has no build step — it runs from source.
- `npm run lint`/`npm run format` enforce shared checks—fix findings before committing.
- API only: `cd packages/api && npm run dev` or `npm start`.

## `packages/embed` implementation rules

The following rules apply to the Svelte frontend rewrite in `packages/embed`

- shadcn components must be imported as-is and placed in directory `packages/embed/src/lib/components/ui`
- design system components built on top of shadcn primitives are to be placed in semantic folders under `packages/embed/src/lib/components`, such as `forms`, `typography`, and `layout`
  Tailwind can be used here to customize styling as necessary, although defining styles through the shadcn theme is preferred if applicable.
  The design system components must expose semantic props for styling variants so that users of the component do not have to apply custom styling.
- Reusable page layouts and page layout helpers are to be placed in `packages/embed/src/lib/components/layout`
- Route-specific components are to be co-located with the routes files in the respective folders under `packages/embed/src/routes`. These components should be built purely with the design system components, shadcn component and layout helpers defined above and should not contain additional Tailwind styles.
- `packages/embed/src/lib/api` contains functions performing raw fetch requests. Components and page `load()` functions must use these functions for api access and never call fetch directly.

## `packages/api` implementation rules

The following rules apply to the services built on Kysely in `packages/api/src`. Each resource has three layers, each a factory that takes `db` and builds the layer below it (`createFarmsController(db)` → `createFarmsDomain(db)` → `createFarmsRepository(db)`).

- **Controllers** (`src/services/<name>.ts`, `src/services/admin/<name>.ts`) own the Feathers transport:
  - parse `params`, ids and query parameters (`$details`, `hasBadge`, `params.user`) into the domain's plain, typed arguments
  - serialise the records they return with `src/services/serializers.ts` (`type`, `link`, nested records), and build other response shapes such as the admin `<Type>_<id>` keys
  - turn `create` and `patch` data into domain input with `fromRequest` from the same module, which drops the `id`, `type` and `link` that clients send back from the records they read
  - register `mapDatabaseErrors` from `src/db/errors.ts` as the service's error hook
  - implement only the methods the resource exposes, and register the authorization-layer hooks
- **Domains** (`src/domain/<name>.ts`) stay minimal: validation, the transaction boundary, orchestration across repositories, and rules such as admin origin scoping or not-found handling.
  - They make several repository calls atomic with `transaction(db, fn)` from `src/repositories/transaction.ts`, passing the handle on as each repository method's last argument.
  - They don't import `kysely`, `pg`, `@feathersjs/feathers`, `src/db/types.ts`, relation helpers or column lists. ESLint enforces this. A client's Feathers query passes through as the opaque `ListQuery` type.
  - `@feathersjs/errors` (`NotFound`, `BadRequest`) is the application's error vocabulary and may be used.
- **Repositories** (`src/repositories/<name>.ts`) own persistence:
  - Kysely queries, column lists, join tables, and the Feathers query translation (`src/db/feathersQuery.ts`)
  - reads that return records already assembled with their relations, as named read shapes (`findSummaries`, `findDetailsById`, `findAdminPage`, …)
  - intent-level relation writes (`saveRelations`)
  - the row and value types (`FarmRow`, `FarmValues`, `FarmChanges`) that the other layers use instead of `src/db/types.ts`
- Code that calls a domain outside a service's own hook chain maps database errors itself with `withFeathersErrors`, because the service's error hooks don't cover it. Examples are the `authorize` hook and the permission conditions.
- Known exceptions, not yet behind a domain: `services/searchIndex.js`, `services/autocomplete.js` and `hooks/email.js` call repositories directly.

## Coding Guidelines

- Do not overengineer, find simple and elegant solutions that are easy to understand and to maintain.
- Avoid unnecessary duplication, but don’t contort code to eliminate small repeats.
- Don’t add libraries for trivial tasks (e.g., one small helper function).
- Follow existing project conventions (style, structure, error handling, naming).
- Use comments only to explain why (constraints, tradeoffs), not what the code is doing.
- Avoid over-generic APIs. If a function only needs one shape, type it that way.
- Use types to clarify intent, keep them as simple and expressive as possible.

## Testing

- Add tests that cover behavior, not implementation details.
- Prefer a few high-signal tests over exhaustive test scaffolding.
