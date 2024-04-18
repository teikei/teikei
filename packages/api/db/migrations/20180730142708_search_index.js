exports.up = async (knex) => {
  await knex.raw(
    '  create materialized view entries_search as\n' +
      "  select id, 'farm' as type, name, to_tsvector(name) as search from farms union select id, 'initiative' as type, name, to_tsvector(name) as search from initiatives\n" +
      "  union select id, 'depot' as type, name, to_tsvector(name) from depots;"
  )
  await knex.raw(
    ' create index idx_search on entries_search using GIN(search);'
  )
  await knex.raw(
    'create unique index entries_search_id_type on entries_search(id, type)'
  )
}

exports.down = async (knex) => {
  return Promise.all([knex.raw('drop materialized view entries_search')])
}
