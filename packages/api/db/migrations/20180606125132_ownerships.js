exports.up = async (knex) => {
  await knex.schema.createTable("depots_users", (table) => {
    table.bigIncrements();
    table.bigint("depot_id");
    table.foreign("depot_id").references("depots_id");
    table.bigint("user_id");
    table.foreign("user_id").references("users_id");
    table.unique(["depot_id", "user_id"]);
  });
  await knex.schema.createTable("farms_users", (table) => {
    table.bigIncrements();
    table.bigint("farm_id");
    table.foreign("farm_id").references("farms_id");
    table.bigint("user_id");
    table.foreign("user_id").references("users_id");
    table.unique(["farm_id", "user_id"]);
  });
  await knex.schema.createTable("initiatives_users", (table) => {
    table.bigIncrements();
    table.bigint("initiative_id");
    table.foreign("initiative_id").references("initiatives_id");
    table.bigint("user_id");
    table.foreign("user_id").references("users_id");
    table.unique(["initiative_id", "user_id"]);
  });
};

exports.down = async (knex) => {};
