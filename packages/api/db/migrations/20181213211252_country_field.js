exports.up = async (knex) => {
  await knex.schema.table("farms", (table) => {
    table.string("country");
    table.string("state");
  });
  await knex.schema.table("depots", (table) => {
    table.string("country");
    table.string("state");
  });
  await knex.schema.table("initiatives", (table) => {
    table.string("country");
    table.string("state");
  });
};

exports.down = async (knex) => {};
