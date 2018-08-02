module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgresql://teikei:teikei@localhost:5432/teikei_next'
}
