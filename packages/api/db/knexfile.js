const devConfig = require("../config/default.json");

module.exports = {
  development: devConfig.postgres,
  test: devConfig.postgres,
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
  },
};
