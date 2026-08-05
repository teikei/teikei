exports.up = async (knex) => {
  await knex.raw(`
        CREATE VIEW farms_origins AS
        SELECT f.id as farm_id, u.origin
        from farms f, farms_users fu, users u
        where f.id = fu.farm_id
        and u.id = fu.user_id
        and u.origin is not null;
    `)
  await knex.raw(`
        CREATE VIEW depots_origins AS
        SELECT d.id as depot_id, u.origin
        from depots d, depots_users du, users u
        where d.id = du.depot_id
        and u.id = du.user_id
        and u.origin is not null;
    `)
  await knex.raw(`
        CREATE VIEW initiatives_origins AS
        SELECT i.id as initiative_id, u.origin
        from initiatives i, initiatives_users iu, users u
        where i.id = iu.initiative_id
        and u.id = iu.user_id
        and u.origin is not null;
    `)
}

exports.down = async (knex) => {}
