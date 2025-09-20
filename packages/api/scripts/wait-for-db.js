#!/usr/bin/env node

const { Client } = require('pg')

const connectionString = 'postgresql://teikei:teikei@localhost:5432/teikei'

async function waitForDatabase() {
  while (true) {
    const client = new Client({ connectionString })

    try {
      await client.connect()
      await client.query('SELECT 1')
      console.log('Database is ready!')
      await client.end()
      process.exit(0)
    } catch (error) {
      console.log('Waiting for database...', error.message)
      try {
        await client.end()
      } catch (endError) {
        // Ignore errors when closing failed connection
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}

waitForDatabase().catch(console.error)
