const { initializeTestDb } = require('./db/integrationTestSetup')
const { TestcontainersEnvironment } = require('@trendyol/jest-testcontainers')

let databaseInitialized = false

class PostgreSQLEnvironment extends TestcontainersEnvironment {
  async setup() {
    await super.setup()
    if (!databaseInitialized) {
      const host = this.global.__TESTCONTAINERS_POSTGRES_IP__
      const port = this.global.__TESTCONTAINERS_POSTGRES_PORT_5432__
      await initializeTestDb(host, port)
      databaseInitialized = true
    }
  }

  // async teardown() {
  //   await super.teardown();
  //   const host = this.global.__TESTCONTAINERS_POSTGRES_IP__
  //   const port = this.global.__TESTCONTAINERS_POSTGRES_PORT_5432__
  //   await dropTestDb(host, port)
  // }
}

module.exports = PostgreSQLEnvironment
