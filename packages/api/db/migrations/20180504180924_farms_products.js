exports.up = async (knex) => {
  await knex.schema.createTable("farms_products", (table) => {
    table.bigIncrements();
    table.bigint("farm_id");
    table.foreign("farm_id").references("entries_id");
    table.bigint("product_id");
    table.unique(["farm_id", "product_id"]);
  });
};

exports.down = async (knex) => {};
