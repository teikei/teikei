# Project Guidelines for AI Agents

## 1. Monorepo Structure

- The workspace uses a monorepo with multiple packages: `admin` (React frontend), `api` (Node.js backend), and `map` (React frontend).
- Each package has its own `package.json`, configuration, and source directories.

## 2. Coding Standards

- Use ESLint for JavaScript/TypeScript linting. Follow the rules defined in `eslint.config.js`.
- Use Prettier formatting conventions where applicable.
- Write clear, descriptive commit messages.

## 3. Frontend (`admin`/`map`)

- Use React (TSX) for UI components.
- Organize components under `src/components`.
- Use TypeScript for new files where possible.
- Place assets in `src/assets` or `public/assets`.
- Use Vite for development and builds.
- Store styles in `src/styles` or as CSS modules.

## 4. Backend (`api`)

- Use Node.js with Feathers.js for the API.
- Organize services under `src/services`.
- Use Knex for database migrations and seeds (see `db/migrations` and `db/seeds`).
- Store configuration in `config/` with environment-specific files.
- Write tests in the appropriate `test` or `__tests__` directories.

## 5. Testing

- Use Jest for backend tests (`api`).
- Use Playwright for frontend end-to-end tests (`map`).
- Place test files alongside source files or in dedicated test directories.
- Ensure new features include relevant tests.

## 6. Environment & Deployment

- Use environment variables as defined in `config/custom-environment-variables.json`.
- Use `deploy_all.sh` for deployment automation.
- Keep secrets and sensitive data out of version control.

## 7. Documentation

- Update `README.md` and `CONTRIBUTING.md` with any significant changes.
- Document new components, services, and utilities.

## 8. General Best Practices

- Reuse existing components and utilities where possible.
- Keep code modular and maintainable.
- Follow the existing folder structure and naming conventions.
- Review and test changes before merging.

## 9. Running & Testing the Project

- Install dependencies from the root with `npm install`.
- To run the frontend (`map`), use `npm run dev` from the root.
- To run the admin frontend (`admin`), use `npm run dev-admin` from the root.
- For end-to-end tests (frontend), use `npm run webtests` from the root.
- For backend tests, use `npm test` in the `api` package.
