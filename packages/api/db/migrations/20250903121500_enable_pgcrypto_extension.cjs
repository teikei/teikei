exports.up = async (knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
}

exports.down = async (knex) => {}
