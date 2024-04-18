exports.up = async (knex) => {
  await knex.schema.table("users", (table) => {
    table.string("reactivation_token").nullable();
  });
};

exports.down = async (knex) => {};
