export const up = async (knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
}

export const down = async (knex) => {}
