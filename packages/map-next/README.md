# map-sv

A pure client-side SvelteKit SPA for the Teikei map application.

## Architecture

This application is configured as a **pure client-side Single Page Application (SPA)** with no server-side rendering or server-side functionality. It uses:

- **@sveltejs/adapter-static** with SPA mode (`fallback: 'index.html'`)
- Client-side routing only
- Paraglide i18n with client-side locale handling

## Developing

Once you've installed dependencies with `npm install`, start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

This will generate static files in the `build` directory that can be deployed to any static hosting service (e.g., Netlify, Vercel, GitHub Pages, S3, etc.).

You can preview the production build with `npm run preview`.

## Testing

Run unit tests:

```sh
npm run test:unit
```

Run end-to-end tests:

```sh
npm run test:e2e
```

## Deployment

Since this is a pure SPA, you can deploy it to any static hosting service. The build output in the `build` directory contains:

- `index.html` - The main entry point and fallback for all routes
- `_app/` - Application assets (JS, CSS)
- Static assets from the `public` directory

Make sure your hosting service is configured to serve `index.html` for all routes (SPA fallback).
