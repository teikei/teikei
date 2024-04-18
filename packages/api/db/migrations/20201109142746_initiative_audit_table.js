exports.up = async (knex) => {
  await knex.raw(`
create trigger initiatives_badges_audit after insert or update or delete on initiatives_badges for each row execute procedure if_modified_func();`);
};

exports.down = async (knex) => {};
