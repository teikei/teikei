module.exports = {
  development: {
    "client": "pg",
    "connection": "postgresql://teikei:teikei@localhost:5432/teikei_dev"
  },
  test: {
    "client": "pg",
    "connection": "postgresql://teikei:teikei@localhost:5432/teikei_test"
  },
  production: {
    "client": "pg",
    "connection": process.env.DATABASE_URL
  }
}
