exports.up = async (knex) => {
  await knex.raw(
    `alter table users alter column verify_changes type jsonb using to_jsonb(verify_changes);`,
  );
};

exports.down = async () => {};
