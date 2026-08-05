import devConfig from '../config/default.json' with { type: 'json' }

export default {
  development: devConfig.postgres,
  test: devConfig.postgres,
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  },
  migrations: {
    extension: 'cjs'
  },
  seeds: {
    extension: 'cjs'
  }
}
