import path from 'path'
import knexDbManager from 'knex-db-manager'
import appLauncher from '../src/app'

const getDbManager = () => {
  const config = {
    knex: {
      client: 'postgres',
      connection: {
        host: global.__TESTCONTAINERS_POSTGRES_IP__,
        port: global.__TESTCONTAINERS_POSTGRES_PORT_5432__,
        database: 'teikei_test',
        user: 'teikei',
        password: 'teikei',
      },
      migrations: {
        directory: path.resolve(__dirname, 'migrations'),
      },
    },
    dbManager: {
      superUser: 'teikei',
      superPassword: 'teikei',
    },
  }
  return knexDbManager.databaseManagerFactory(config)
}

export const getTestDbConnectionString = () => {
  return `postgresql://teikei:teikei@${global.__TESTCONTAINERS_POSTGRES_IP__}:${global.__TESTCONTAINERS_POSTGRES_PORT_5432__}/teikei_test`
}

const initializeTestDb = async () => {
  console.log('setting up postgres')
  const dbManager = getDbManager()
  console.log(`preparing database`)
  console.log('creating database')
  await dbManager.createDb()
  console.log('creating db owner')
  await dbManager.createDbOwnerIfNotExist()
  console.log('migrating')
  await dbManager.migrateDb()
  console.log('seeding')
  const seedsPath = path.resolve(__dirname, 'seeds', '*.js')
  console.log(seedsPath)
  await dbManager.populateDb(seedsPath)
  console.log('done')
  await dbManager.close()
}

const dropTestDb = async () => {
  const dbManager = getDbManager()
  await dbManager.dropDb()
  await dbManager.close()
}

const truncateTestDb = async () => {
  const dbManager = getDbManager()

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

export const setupIntegrationTestDb = () => {
  let app
  beforeAll(async () => {
    app = appLauncher.startApp({
      postgres: {
        client: 'pg',
        connection: getTestDbConnectionString(),
      },
    })
  })
  beforeAll(async () => {
    await initializeTestDb()
  })

  afterAll(async () => {
    await dropTestDb()
  })

  afterEach(async () => {
    await truncateTestDb()
  })
  return app
}
