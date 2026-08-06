**Production**

![Map CI](https://github.com/teikei/teikei/actions/workflows/map-ci.yml/badge.svg)
![API CI](https://github.com/teikei/teikei/actions/workflows/api-ci.yml/badge.svg)
![Admin CI](https://github.com/teikei/teikei/actions/workflows/admin-ci.yml/badge.svg)

**Preview**

![Map CI](https://github.com/teikei/teikei/actions/workflows/map-ci.yml/badge.svg?branch=preview)
![API CI](https://github.com/teikei/teikei/actions/workflows/api-ci.yml/badge.svg?branch=preview)
![Admin CI](https://github.com/teikei/teikei/actions/workflows/admin-ci.yml/badge.svg?branch=preview)

# Teikei

Teikei is a web application and API that maps out community-supported agriculture in Germany, Switzerland, and Austria, based on crowdsourced data.

It is used by

- [Ernte teilen](https://ernte-teilen.org)
- [Kooperationsstelle für solidarische Landwirtschaft](https://www.solawi.ch)
- [Netzwerk für solidarische Landwirtschaft](https://www.solidarische-landwirtschaft.org)

## Introduction

The repository is a monorepo consisting of 3 modules:

### API /api

Teikei API is a [Node](https://nodejs.org/en/) application written with [Feathers](https://feathersjs.com/) using [Express](https://expressjs.com/) as a server. It exposes a JSON REST API, data is stored in [PostgreSQL](https://www.postgresql.org/). It also includes a job queue built with node-schedule.

### Map /map

Teikei Map is a Single Page Application built with React and Redux. It was generated with the default [create-react-app](https://github.com/facebook/create-react-app) with added Sass support. Uses leaflet to display the map, feathers-client to connect to the API backend, joi for validation, superagent as a REST client.

### Admin /admin

Teikei Admin allows content moderators and administrators to update and manage stored data. It connects to the same Teikei API backend application as the frontend module, but through separate Admin API endpoints. It's built with [crudl.io](https://crudl.io/), an open-source admin dashboard.

The monorepo makes use of npm workspaces and lerna and provides top-level scripts to run a complete Teikei application stack with a single command and to conveniently work with all 3 modules from a single repository.

## Getting started

### Requirements

Teikei requires node >= 18, npm and PostgreSQL >= 9.5.

### Get the code

Clone the repository and install dependencies

```javascript
git clone https://github.com/teikei/teikei
cd teikei
npm install
```

### Configure project settings

You need to create an `.env` file in the root directory which contains the environment variables needed to run the project. The included `.env.sample` file lists the variables which need to be set.

After creating the root `.env` file, run `scripts/link-env.sh` to symlink it into each package (`packages/api`, `packages/admin`, `packages/map`, `packages/map-next`).

### Development Mode

Development mode will run the database in a Docker container and populate is with new test data on each run. Make sure you have Docker installed and running on your machine before starting the development server.

#### Running API / Map in development mode

- To start the map application in development mode run `npm run dev`
- The map frontend will be started at http://localhost:3000. The frontend express server runs on port 3000 and will proxy request to the API server on port 3030.
- The API server will run on http://localhost:3030

#### Or: Running API / Admin in development mode

- To start the admin application in development mode run `npm run dev:admin`
- The admin frontend will be started at http://localhost:4000. The frontend express server runs on port 3000 and will proxy request to the API server on port 3030.
- The API server will run on http://localhost:3030

#### Build for production

- Build the project for production with `npm run build`either in the root directory to build all modules or individually in module subfolders. The build output will be copied to the /build folders of modules.

#### Deployment

- Every package is deployed to Dokku from this repository, one app per package and environment. The `.dokku-monorepo` file maps an app to its subfolder by **substring match** on the app name, first match wins — so `teikei-map` and `teikei-map-preview` build from `packages/map`, and `teikei-embed` and `teikei-embed-preview` build from `packages/map-next`. Keep the `map` entry last, otherwise it would swallow other names.

  | package             | preview (branch `preview`) | production (branch `main`) |
  | ------------------- | -------------------------- | -------------------------- |
  | `packages/api`      | `teikei-api-preview`       | `teikei-api`               |
  | `packages/map`      | `teikei-map-preview`       | `teikei-map`               |
  | `packages/map-next` | `teikei-embed-preview`     | `teikei-embed`             |
  | `packages/admin`    | `teikei-admin-preview`     | `teikei-admin`             |

- The API is deployed to Dokku via the Node.js buildpack and runs straight from `src`, without a build step. Its apps (`teikei-api`, `teikei-api-preview`) must therefore have `NPM_CONFIG_PRODUCTION=true` set, so that devDependencies never end up in the deployed image. Everything the API needs at runtime belongs in `dependencies`.
- The frontend apps do need their devDependencies to build, so do **not** set this globally.
- `packages/map-next` builds to `build/` via `adapter-static`, so its apps need `NGINX_ROOT=build`. `VITE_API_URL` is baked in at build time and must be set per app — the committed `.env` fallback points at the preview API, so a production app without it would silently talk to preview.

### Test data

- To create initial data, run `npm run seed:run` inside the /api folder
- The command will create the following test users

| username               | password | roles      |
| ---------------------- | -------- | ---------- |
| superadmin@example.com | admin    | superadmin |
| admin@example.com      | admin    | admin      |
| user@example.com       | admin    | user       |

This step will be performed automatically if you start a development server with `npm run dev` or `npm run dev:admin`.

## Roadmap

We use Github to plan upcoming features and track bugs. If you want to participate, it's probably a good idea to look for open issues there. Before working on bigger features, however, it's advisable to get in contact with us, so that we can coordinate tasks and features.

## Report a bug

Bugs, Issues and Feature requests can be added as issues here on Github. Please provide as much information as possible, including steps to reproduce the issue.

## Authors & contributors

- [Simon Jockers](https://github.com/sjockers)
- [Christian Rijke](https://github.com/crijke)

## Alumni

- [Tobias Preuss](https://github.com/johnjohndoe)
- [Daniel Mack](https://github.com/zonque)
- Charis Braun
- Maria Dolecek

## License

- The Teikei source code is released under the [AGPL 3.0](https://www.gnu.org/licenses/agpl-3.0.html)
- Assets in this repository are released under the [Attribution-ShareAlike 4.0 International CC license](http://creativecommons.org/licenses/by-sa/4.0/)
