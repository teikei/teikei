exports.up = async (knex) => {
  await knex.schema.createTable("farms", (table) => {
    table.bigIncrements();
    table.integer("legacy_id");
    table.string("name");
    table.string("city");
    table.string("address");
    table.decimal("latitude", null);
    table.decimal("longitude", null);
    table.string("url");
    table.string("accepts_new_members");
    table.text("description");
    table.integer("founded_at_year");
    table.integer("founded_at_month");
    table.integer("maximum_members");
    table.text("additional_product_information");
    table.text("participation");
    table.boolean("acts_ecological");
    table.text("economical_behavior");
    table.unique(["legacy_id"]);
    table.timestamps();
  });
};

exports.down = async (knex) => {};
