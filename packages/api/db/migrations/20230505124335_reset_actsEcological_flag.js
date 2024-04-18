exports.up = async (knex) => {
  await knex.raw(`
UPDATE farms set acts_ecological = false
`);
};

exports.down = async (knex) => {};
