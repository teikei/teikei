exports.up = async (knex) => {
  await knex.raw(`
with greatest_date_per_user as
         (select user_id, greatest(greatest_date) as max_date
          from (select u.id as user_id, greatest(created_at, updated_at) as greatest_date
                from users u
                union
                select du.id, greatest(d.created_at, d.updated_at)
                from depots_users du,
                     depots d
                where d.id = du.depot_id
                group by du.id, d.created_at, d.updated_at
                union
                select fu.id, greatest(f.created_at, f.updated_at)
                from farms_users fu,
                     farms f
                where f.id = fu.farm_id
                group by fu.id, f.created_at, f.updated_at
                union
                select iu.id, greatest(i.created_at, i.updated_at)
                from initiatives_users iu,
                     initiatives i
                where i.id = iu.initiative_id
                group by iu.id, i.created_at, i.updated_at) as greatest_date_per_entity
          group by user_id, greatest_date)
update users u
set last_login = greatest_date_per_user.max_date
from greatest_date_per_user
where greatest_date_per_user.user_id = u.id`);
};

exports.down = async (knex) => {};
