exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw(
      '  create materialized view entries_search as\n' +
        "  select id, 'farm' as type, name, to_tsvector(name) as search from farms union select id, 'initiative' as type, name, to_tsvector(name) as search from initiatives\n" +
        "  union select id, 'initiative' as type, name, to_tsvector(name) from depots;"
    ),
    knex.raw(' create index idx_search on entries_search using GIN(search);'),
    knex.raw(
      'create unique index idx_entries_search_id_type_name on entries_search(id, type, name)'
    )
  ])
}

exports.down = function(knex, Promise) {
  return Promise.all([knex.raw('drop materialized view entries_search')])
}
