Your goal is to reimplement the user sign-in and sign-up pages in package 'map'.

The 'map' package is using react, react-router and Vite.

The following pages need to be re-implemented:

- packages/map/src/routes/users/signin.tsx
- packages/map/src/routes/users/signup.tsx

Reimplement all required components like UserOnboarding, SignUpForm, SignInForm according to the following
guidelines:

- use react-hook-form
- validate using zod schemas
- Validation errors should be displayed on the form as errors. Use default mechanism for this, including
  default visual styles from shadcn.
- shadcn and tailwind are already configured, do not change the configuration if errors are encountered. Point out issues  
  with the configuration instead.
- use shadcn components for the form elements. Add shadcn components using the cli as required for your implementation:
  example: npx shadcn@latest add button
- do not try to emulate the current styling of the form elements. Use the shadcn components as is without custom styling.
- replace any legacy scss styles for page and container layouts of the page with Tailwind styles. Again, not for the form
  elements themselves, just the layout and responsive behavior of the page. SCSS styles for form elements should be discarded.
