import devConfig from '../config/default.json' with { type: 'json' }

// knex's built-in .js stub is CommonJS, which this package can no longer load
const migrations = { stub: 'migration.stub' }

export default {
  development: { ...devConfig.postgres, migrations },
  test: { ...devConfig.postgres, migrations },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations
  }
}
