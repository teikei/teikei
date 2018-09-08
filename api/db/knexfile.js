const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

module.exports = {
  development: {
    "client": "pg",
    "connection": "postgresql://teikei:teikei@localhost:5432/teikei_dev"
  },
  test: {
    "client": "pg",
    "connection": process.env.TEST_DATABASE_URL
  },
  production: {
    "client": "pg",
    "connection": process.env.DATABASE_URL
  }
}
