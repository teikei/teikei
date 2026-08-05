export const up = async (knex) => {
  await knex.raw(`
UPDATE farms set acts_ecological = false
`)
}

export const down = async (knex) => {}
