exports.up = async (knex) => {
  await knex.raw(`
    drop materialized view entries_search;
    `)
  await knex.raw(`
    create materialized view entries_search as
    select id, 'farm' as type, name, to_tsvector(name) as search
    from farms
    where farms.active = true
    union
    select id, 'initiative' as type, name, to_tsvector(name) as search
    from initiatives
    where initiatives.active = true
    union
    select id, 'depot' as type, name, to_tsvector(name)
    from depots
    where depots.active = true ;
    `)
  await knex.raw(`
    create index idx_search on entries_search using GIN(search);`)
  await knex.raw(`
    create unique index entries_search_id_type on entries_search(id, type)
    `)
}

exports.down = async (knex) => {
  return Promise.all([knex.raw("drop materialized view entries_search")])
}
