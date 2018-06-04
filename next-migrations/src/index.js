import knex from 'knex'
import config from './knexfile'
import yaml from 'js-yaml'
import fp from 'lodash/fp'
import _ from 'lodash'

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
  from places where type = 'Farm'
  ON CONFLICT DO NOTHING;
`
  )

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
    accepts_new_members,
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
  latitude, 
  longitude, 
  url, 
  accepts_new_members, 
  delivery_days, 
  description, 
  created_at, 
  updated_at 
  from places where type = 'Depot'
  ON CONFLICT DO NOTHING;
`
  )

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
  latitude, 
  longitude, 
  url, 
  description, 
  created_at, 
  updated_at 
  from places where type = 'Initiative'
  ON CONFLICT DO NOTHING;
`
  )

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

  console.log('creating farm-product relation')

  const mapValues = fp.mapValues.convert({ cap: false })

  const farms = await teikei('places')
    .select('id', 'vegetable_products', 'animal_products', 'beverages')
    .where('type', 'Farm')
    .map(mapValues((v, k) => (k !== 'id' ? yaml.safeLoad(v) : v)))

  const productEntries = farms
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

  console.log('done.')

  teikei.destroy()
}

migrateLegacyData()
