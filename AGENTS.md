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
- `npm run dev` starts Dockerized Postgres, the API, and the map; `npm run dev-admin` starts the admin UI.
- `npm run build` runs each package build (`vite build`, `babel`) for production bundles.
- `npm run lint`/`npm run prettier` enforce shared checks—fix findings before committing.
- API only: `cd packages/api && npm run dev` or `npm run build && npm start`.

## `packages/map-next` implementation rules

The following rules apply to the Svelte frontend rewrite in `packages/map-next`

- shadcn components must be imported as-is and placed in directory `packages/map-next/src/lib/components/shadcn`
- design system components built on top of shadcn primitives are to be placed in `packages/map-next/src/lib/components/design-system`
  Tailwind can be used here to customize styling as necessary, although defining styles through the shadcn theme is preferred if applicable.
  The design system components must expose semantic props for styling variants so that users of the component do not have to apply custom styling. This directory can have subfolders like `packages/map-next/src/lib/components/design-system/forms` for form-specific custom components like non-standard input fields.
- Reusable page layouts and page layout helpers are to be placed in `packages/map-next/src/lib/components/layout`
- Route-specific components are to be co-located with the routes files in the respective folders under `packages/map-next/src/routes`. These components should be built purely with the design system components, shadcn component and layout helpers defined above and should not contain additional Tailwind styles.
- `packages/map-next/src/lib/api` contains functions performing raw fetch requests. Components and page `load()` functions must use these functions for api access and never call fetch directly.
