# Repository Guidelines

## Project Structure & Module Organization

- Root uses npm workspaces plus Lerna; shared tooling lives in `package.json`, `scripts/`, and `eslint.config.js`.
- API resides in `packages/api` (Feathers/Express) with migrations in `db/` and job/email helpers in `scripts/`.
- Frontend apps:
  - legacy map in `packages/map` (React/Vite) with feature code in `src/`, assets in `public/`, webtests in `src/webtests`; This app serves as a reference for the rewrite but must not be updated, except when explicity told to do so eg in the case of necessary production hotfixes.
  - admin in `packages/admin` (React Admin) with resources under `src/`. This is the admin panel for content moderation, a separate React app built with react-admin.
  - new svelte frontend rewrite in `packages/map-next`. This is the new frontend application that is currently being developed. It is using Svelte, Sveltekit and shadcn-svelte.

## Build, Test, and Development Commands

- `npm install` bootstraps all workspaces; rerun after dependency updates.
- `npm run dev` starts Dockerized Postgres, the API, and the map (packages/map-next)
- `npm run dev:admin` starts the admin UI.
- `npm run dev:legacy` starts Dockerized Postgres, the API, and the legacy map (packages/map)
- `npm run build` runs each package build (`vite build`, `babel`) for production bundles.
- `npm run lint`/`npm run format` enforce shared checks—fix findings before committing.
- API only: `cd packages/api && npm run dev` or `npm run build && npm start`.

## `packages/map-next` implementation rules

The following rules apply to the Svelte frontend rewrite in `packages/map-next`

- shadcn components must be imported as-is and placed in directory `packages/map-next/src/lib/components/ui`
- design system components built on top of shadcn primitives are to be placed in semantic folders under `packages/map-next/src/lib/components`, such as `forms`, `typography`, and `layout`
  Tailwind can be used here to customize styling as necessary, although defining styles through the shadcn theme is preferred if applicable.
  The design system components must expose semantic props for styling variants so that users of the component do not have to apply custom styling.
- Reusable page layouts and page layout helpers are to be placed in `packages/map-next/src/lib/components/layout`
- Route-specific components are to be co-located with the routes files in the respective folders under `packages/map-next/src/routes`. These components should be built purely with the design system components, shadcn component and layout helpers defined above and should not contain additional Tailwind styles.
- `packages/map-next/src/lib/api` contains functions performing raw fetch requests. Components and page `load()` functions must use these functions for api access and never call fetch directly.

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
