exports.up = async (knex) => {
  await knex.schema.createTable("initiatives_badges", (table) => {
    table.bigIncrements();
    table.bigint("badge_id");
    table.foreign("badge_id").references("badges_id");
    table.bigint("initiative_id");
    table.foreign("initiative_id").references("initiative_id");
    table.unique(["initiative_id", "badge_id"]);
  });
};

exports.down = async (knex) => {};
