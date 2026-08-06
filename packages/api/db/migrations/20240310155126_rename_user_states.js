export const up = async (knex) => {
  await knex.raw(`
    ALTER TABLE users ALTER COLUMN state SET DEFAULT 'RECENT_LOGIN';
  `)
  await knex.raw(`
    UPDATE users set state = 'RECENT_LOGIN' where state = 'ACTIVE'
  `)
  await knex.raw(`
    UPDATE users set state = 'REMINDER_SENT' where state = 'ACTIVE_REMINDER_SENT'
  `)
  await knex.raw(`
    UPDATE users set state = 'SECOND_REMINDER_SENT' where state = 'ACTIVE_SECOND_REMINDER_SENT'
  `)
  await knex.raw(`
    UPDATE users set state = 'NO_RESPONSE' where state = 'INACTIVE_NO_RESPONSE'
  `)
}

export const down = async (knex) => {}
