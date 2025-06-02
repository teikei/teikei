Your goal is to reimplement user account management pages in package 'map' (packages/map).

The 'map' package is using react, react-router and Vite.

The following pages need to be re-implemented:

- packages/map/src/routes/users/edit-account.tsx
- packages/map/src/routes/users/forgot-password.tsx
- packages/map/src/routes/users/reset-password.tsx

The following pages have already been reimplemented and serve as a reference for the desired re-implementation:

- packages/map/src/routes/users/signin.tsx
- packages/map/src/routes/users/signup.tsx

Reimplement all required components according to the following
guidelines:

- use react-hook-form
- validate using zod schemas
- Do not use Redux or any other state management library, replace any code relating to redux-form.
- use react-query
- Validation errors should be displayed on the form as errors. Use a default mechanism for this, including
  default visual styles from shadcn.
- shadcn and tailwind are already configured, do not change the configuration if errors are encountered. Point out issues  
  with the configuration instead.
- use shadcn components for the form elements. Add shadcn components using the cli as required for your implementation.
  example: npx shadcn@latest add button
- do not try to emulate the current styling of the form elements. Use the shadcn components as is without custom styling.
- replace any legacy scss styles for page and container layouts of the page with Tailwind styles. Again, not for the form
  elements themselves, just the layout and responsive behavior of the page. SCSS styles for form elements should be discarded.
