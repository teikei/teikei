const path = require("path");
const knexDbManager = require("knex-db-manager");
const { GenericContainer } = require("testcontainers");

let dbManager, host, port;

const getDbManager = () => {
  if (!dbManager) {
    const config = {
      knex: {
        client: "postgres",
        connection: {
          host,
          port,
          database: "teikei",
          user: "teikei",
          password: "teikei",
        },
        migrations: {
          directory: path.resolve(__dirname, "migrations"),
        },
      },
      dbManager: {
        superUser: "teikei",
        superPassword: "teikei",
      },
    };
    dbManager = knexDbManager.databaseManagerFactory(config);
  }
  return dbManager;
};

const setupIntegrationTestDb = async () => {
  const buildContext = path.resolve(__dirname);
  const container = await GenericContainer.fromDockerfile(buildContext).build();

  const startedContainer = await container.withExposedPorts(5432).start();

  host = startedContainer.getHost();
  port = startedContainer.getMappedPort(5432);

  const dbManager = getDbManager();
  await dbManager.migrateDb();

  const seedsPath = path.resolve(__dirname, "seeds", "*.js");
  await dbManager.populateDb(seedsPath);
};

const getTestDbConnectionString = () => {
  return `postgresql://teikei:teikei@${host}:${port}/teikei`;
};

const truncateTestDb = async () => {
  const dbManager = getDbManager();

  await dbManager.truncateDb([
    "users",
    "users_roles",
    "products",
    "goals",
    "roles",
    "badges",
    "knex_migrations",
    "knex_migrations_lock",
  ]);
  // keep initial seed users
  await dbManager.knexInstance()("users").where("id", ">", 3).delete();
  await dbManager
    .knexInstance()("users_roles")
    .where("user_id", ">", 3)
    .delete();
  await dbManager.close();
};

module.exports = {
  setupIntegrationTestDb,
  getTestDbConnectionString,
  truncateTestDb,
};
