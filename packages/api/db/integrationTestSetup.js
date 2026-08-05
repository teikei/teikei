import knexDbManager from 'knex-db-manager'
import path from 'path'
import { GenericContainer } from 'testcontainers'

let dbManager, host, port

const getDbManager = () => {
  if (!dbManager) {
    const config = {
      knex: {
        client: 'postgres',
        connection: {
          host,
          port,
          database: 'teikei',
          user: 'teikei',
          password: 'teikei'
        },
        migrations: {
          directory: path.resolve(import.meta.dirname, 'migrations')
        }
      },
      dbManager: {
        superUser: 'teikei',
        superPassword: 'teikei'
      }
    }
    dbManager = knexDbManager.databaseManagerFactory(config)
  }
  return dbManager
}

export const setupIntegrationTestDb = async () => {
  if (process.env.TEST_DB_HOST) {
    host = process.env.TEST_DB_HOST
    port = Number(process.env.TEST_DB_PORT)
  } else {
    const buildContext = path.resolve(import.meta.dirname)
    const container =
      await GenericContainer.fromDockerfile(buildContext).build()

    const startedContainer = await container.withExposedPorts(5432).start()

    host = startedContainer.getHost()
    port = startedContainer.getMappedPort(5432)
  }

  const dbManager = getDbManager()
  await dbManager.migrateDb()

  const seedsPath = path.resolve(import.meta.dirname, 'seeds', '*.cjs')
  await dbManager.populateDb(seedsPath)
}

export const getTestDbConnectionString = () => {
  return `postgresql://teikei:teikei@${host}:${port}/teikei`
}

export const truncateTestDb = async () => {
  const dbManager = getDbManager()

  await dbManager.truncateDb([
    'users',
    'users_roles',
    'products',
    'goals',
    'roles',
    'badges',
    'knex_migrations',
    'knex_migrations_lock'
  ])
  // keep initial seed users
  await dbManager.knexInstance()('users').where('id', '>', 3).delete()
  await dbManager
    .knexInstance()('users_roles')
    .where('user_id', '>', 3)
    .delete()
  await dbManager.close()
}
