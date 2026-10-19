# Contributing

If you make improvements to this application, please share them with others.

- Fork the project on GitHub.
- Make your feature addition or bug fix.
- Commit with Git.
- Send the author a pull request.

If you add functionality to this application, create an alternative
implementation, or build an application that is similar, please contact us
and We will add a note to the README so that others can find your work.

## Database migrations

The API (`packages/api`) migrates with knex and queries with Kysely. Kysely's
row types in `src/db/types.ts` are generated from the migrated schema, so
regenerate them after every schema change. With the dev database running
(`npm run db` from the repository root):

```sh
cd packages/api
npm run migrate:make -- <migration_name>  # writes db/migrations/<timestamp>_<migration_name>.js
npm run migrate:latest                    # applies it to the dev database
npm run db:types                          # regenerates src/db/types.ts
```

Commit the migration together with the regenerated `src/db/types.ts`. Never
rename a migration once it has been applied anywhere: knex tracks applied
migrations by file name.
