exports.up = async (knex) => {
  await knex.schema.createTable("products", (table) => {
    table.bigIncrements();
    table.string("category");
    table.string("name");
    table.unique(["category", "name"]);
  });
};

exports.down = async (knex) => {};
