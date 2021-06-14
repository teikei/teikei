const path = require('path')
const knexDbManager = require('knex-db-manager')
const pino = require('pino')

const log = pino()

let dbManager

const getDbManager = (host, port) => {
  if (!dbManager) {
    const config = {
      knex: {
        client: 'postgres',
        connection: {
          host,
          port,
          database: 'teikei_test',
          user: 'teikei',
          password: 'teikei',
        },
        migrations: {
          directory: path.resolve(__dirname, 'migrations'),
        },
      },
      dbManager: {
        superUser: 'teikeiroot',
        superPassword: 'teikeiroot',
      },
    }
    dbManager = knexDbManager.databaseManagerFactory(config)
  }
  return dbManager
}

const getTestDbConnectionString = () => {
  return `postgresql://teikei:teikei@${global.__TESTCONTAINERS_POSTGRES_IP__}:${global.__TESTCONTAINERS_POSTGRES_PORT_5432__}/teikei_test`
}

const initializeTestDb = async (host, port) => {
  log.info('setting up postgres')
  const dbManager = getDbManager(host, port)
  log.info('creating db owner')
  await dbManager.createDbOwnerIfNotExist()
  log.info('creating database')
  await dbManager.createDb()
  log.info('migrating')
  await dbManager.migrateDb()
  log.info('seeding')
  const seedsPath = path.resolve(__dirname, 'seeds', '*.js')
  log.info(seedsPath)
  await dbManager.populateDb(seedsPath)
  log.info('done')
  await dbManager.close()
}

const dropTestDb = async (host, port) => {
  const dbManager = getDbManager(host, port)
  await dbManager.closeKnex()
  await dbManager.dropDb('teikei_test')
}

const truncateTestDb = async (host, port) => {
  const dbManager = getDbManager(host, port)

  await dbManager.truncateDb([
    'users',
    'users_roles',
    'products',
    'goals',
    'roles',
    'badges',
    'knex_migrations',
    'knex_migrations_lock',
  ])
  // keep initial seed users
  await dbManager.knexInstance()('users').where('id', '>', 3).delete()
  await dbManager
    .knexInstance()('users_roles')
    .where('user_id', '>', 3)
    .delete()
  await dbManager.close()
}

const setupIntegrationTestDb = () => {
  const host = global.__TESTCONTAINERS_POSTGRES_IP__
  const port = global.__TESTCONTAINERS_POSTGRES_PORT_5432__
  afterEach(async () => {
    await truncateTestDb(host, port)
  })
}

module.exports = {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb,
  dropTestDb,
  initializeTestDb,
}
