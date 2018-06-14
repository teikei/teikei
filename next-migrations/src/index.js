import knex from 'knex'
import yaml from 'js-yaml'
import fp from 'lodash/fp'
import _ from 'lodash'

import config from './knexfile'

const teikei = knex(config)

const migrateLegacyData = async () => {
  console.log('creating farms')
  await teikei.schema.raw(
    `
  INSERT INTO 
    next_farms (
    legacy_id,
    name, 
    address, 
    city, 
    latitude, 
    longitude, 
    url, 
    accepts_new_members,
    description,
    founded_at_year,
    founded_at_month,
    maximum_members,
    additional_product_information,
    participation,
    acts_ecological,
    economical_behavior,
    created_at,
    updated_at
  )
  SELECT 
  cast(id as int), 
  name, 
  address, 
  city, 
  cast(latitude as float), 
  cast(longitude as float), 
  url, 
  accepts_new_members,
  description,
  founded_at_year,
  founded_at_month,
  maximum_members,
  additional_product_information,
  participation,
  acts_ecological,
  economical_behavior,
  created_at, 
  updated_at 
  from places where type = 'Farm'
  ON CONFLICT DO NOTHING;
`
  )

  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_farms', 'id'), (select max(id) + 1 from next_farms));
  `)

  console.log('creating depots')
  await teikei.schema.raw(
    `
  INSERT INTO 
  next_depots (
    legacy_id,
    name, 
    address, 
    city, 
    latitude, 
    longitude, 
    url, 
    delivery_days, 
    description, 
    created_at, 
    updated_at 
  )
  SELECT 
  cast(id as int), 
  name, 
  address, 
  city, 
  cast(latitude as float), 
  cast(longitude as float), 
  url, 
  delivery_days, 
  description, 
  created_at, 
  updated_at 
  from places where type = 'Depot'
  ON CONFLICT DO NOTHING;
`
  )

  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_depots', 'id'), (select max(id) + 1 from next_depots));
  `)

  console.log('creating initiatives')
  await teikei.schema.raw(
    `
  INSERT INTO 
  next_initiatives (
    legacy_id,
    name, 
    address, 
    city, 
    latitude, 
    longitude, 
    url, 
    description, 
    created_at, 
    updated_at 
  )
  SELECT 
  cast(id as int), 
  name, 
  address, 
  city, 
  cast(latitude as float), 
  cast(longitude as float), 
  url, 
  description, 
  created_at, 
  updated_at 
  from places where type = 'Initiative'
  ON CONFLICT DO NOTHING;
`
  )

  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_initiatives', 'id'), (select max(id) + 1 from next_initiatives));
  `)

  console.log('creating products')
  await teikei.schema.raw(`
  INSERT INTO next_products (
    category, name
  ) values 
  ('vegetable_products', 'vegetables'), 
  ('vegetable_products', 'fruits'), 
  ('vegetable_products', 'mushrooms'), 
  ('vegetable_products', 'cereals'), 
  ('vegetable_products', 'bread_and_pastries'), 
  ('vegetable_products', 'spices'), 
  ('animal_products', 'eggs'), 
  ('animal_products', 'meat'), 
  ('animal_products', 'sausages'), 
  ('animal_products', 'milk'), 
  ('animal_products', 'dairy'), 
  ('animal_products', 'fish'), 
  ('animal_products', 'honey'), 
  ('beverages', 'juice'), 
  ('beverages', 'wine'), 
  ('beverages', 'beer') 
  ON CONFLICT DO NOTHING;
  `)

  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_products', 'id'), (select max(id) + 1 from next_products));
  `)

  console.log('creating farm-product relation')

  const mapValues = fp.mapValues.convert({ cap: false })

  const farms = await teikei('places')
    .select('id', 'vegetable_products', 'animal_products', 'beverages')
    .where('type', 'Farm')
    .map(mapValues((v, k) => (k !== 'id' ? yaml.safeLoad(v) : v)))

  const productEntries = farms
    // eslint-disable-next-line
    .map(({ id, animal_products, vegetable_products, beverages }) => {
      const makeProductRelation = set =>
        (set && set.map(p => ({ id, p }))) || []

      return _.concat(
        makeProductRelation(animal_products),
        makeProductRelation(vegetable_products),
        makeProductRelation(beverages)
      )
    })
    .flatten()

  const resolvedProductEntries = await Promise.all(
    productEntries.map(async ({ id, p }) => {
      const product = await teikei('next_products')
        .select('id')
        .where('name', p)
      return { farm_id: id, product_id: product[0].id }
    })
  )
  await teikei('next_farms_products').delete()
  await teikei('next_farms_products').insert(resolvedProductEntries)

  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_farms_products', 'id'), (select max(id) + 1 from next_farms_products));
  `)

  console.log('creating users')
  await teikei.schema.raw(`
  insert into next_users(
  id, email, name, password, 
  origin, baseurl, phone, 
  is_verified, verify_token, verify_expires, verify_changes, 
  reset_token, reset_expires, 
  created_at, updated_at)
  select id, email, name, encrypted_password, origin, baseurl, phone,
  (confirmed_at is not null), null, null, null,
  null, null, created_at, updated_at from users
  on conflict do nothing;
  `)

  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_users', 'id'), (select max(id) + 1 from next_users));
  `)

  console.log('creating ownerships')

  await teikei.schema.raw(`
  insert into next_depots_users(depot_id, user_id) 
  select nd.id, o.user_id from ownerships o, places p, next_depots nd
  where p.id = o.place_id
  and nd.legacy_id = p.id
  and p.type = 'Depot'
  on conflict do nothing;
  `)
  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_depots_users', 'id'), (select max(id) + 1 from next_depots_users));
  `)
  await teikei.schema.raw(`
  insert into next_farms_users(farm_id, user_id) 
  select nd.id, o.user_id from ownerships o, places p, next_farms nd
  where p.id = o.place_id
  and nd.legacy_id = p.id
  and p.type = 'Farm'
  on conflict do nothing;
  `)
  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_farms_users', 'id'), (select max(id) + 1 from next_farms_users));
  `)
  await teikei.schema.raw(`
  insert into next_initiatives_users(initiative_id, user_id) 
  select nd.id, o.user_id from ownerships o, places p, next_initiatives nd
  where p.id = o.place_id
  and nd.legacy_id = p.id
  and p.type = 'Initiative'
  on conflict do nothing;
  `)
  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_initiatives_users', 'id'), (select max(id) + 1 from next_initiatives_users));
  `)

  console.log('creating farm-depot links')
  await teikei.schema.raw(`
  insert into next_farms_depots(farm_id, depot_id) 
  select f.id, d.id
  from place_connections pc, next_farms f, next_depots d
  where pc.place_b_id = f.legacy_id
  and pc.place_a_id = d.legacy_id
  on conflict do nothing;
  `)
  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_farms_depots', 'id'), (select max(id) + 1 from next_farms_depots));
  `)

  console.log('creating initiative goals')
  await teikei.schema.raw(`
  insert into next_goals(name) 
  values ('land'), ('staff'),
  ('organizers'), ('consumers')
  on conflict do nothing;
  `)
  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_goals', 'id'), (select max(id) + 1 from next_goals));
  `)

  await teikei.schema.raw(`
  insert into next_initiatives_goals(initiative_id, goal_id) 
  select ni.id, gi.goal_id from next_initiatives ni, places p, goals_initiatives gi
  where p.id = ni.legacy_id
  and p.type = 'Initiative'
  and gi.initiative_id = p.id
  on conflict do nothing;
  `)
  await teikei.schema.raw(`
  select setval(pg_get_serial_sequence('next_initiatives_goals', 'id'), (select max(id) + 1 from next_initiatives_goals));
  `)

  console.log('done.')

  teikei.destroy()
}

migrateLegacyData()
