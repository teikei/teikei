const devConfig = require('../config/default.json')

module.exports = {
  development: devConfig.postgres,
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },
}
