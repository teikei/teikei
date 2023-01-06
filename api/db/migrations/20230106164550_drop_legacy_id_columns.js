/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  await knex.raw(`
    alter table farms drop column legacy_id;
    `)
  await knex.raw(`
    alter table depots drop column legacy_id;
    `)
  await knex.raw(`
    alter table initiatives drop column legacy_id;
    `)
}

exports.down = async () => {}
