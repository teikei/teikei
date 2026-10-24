/**
 * Remove the leading postcode from `city`.
 *
 * The legacy map saved "<postcode> <city>" into `city` until #772. Where that
 * postcode differs from `postalcode`, the dedicated field is the accurate one,
 * so it is always kept; the city postcode only fills an empty `postalcode`.
 * `updated_at` stays untouched, as this is a data fix, not a user edit.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  for (const table of ['farms', 'depots', 'initiatives']) {
    await knex.raw(
      `UPDATE ??
       SET postalcode = coalesce(nullif(trim(postalcode), ''), substring(city FROM '^\\s*(\\d{4,5})\\s')),
           city = regexp_replace(city, '^\\s*\\d{4,5}\\s+', '')
       WHERE city ~ '^\\s*\\d{4,5}\\s+\\S'`,
      [table]
    )
  }
}

/**
 * The original city values are not kept, so this migration cannot be undone.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {}
