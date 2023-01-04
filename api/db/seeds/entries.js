exports.seed = async (knex) => {
  await knex('depots').truncate()
  await knex('depots').insert([
    {
      url: 'http://www.exampledepot.com',
      name: 'Beispiel-Depot 1',
      address: 'Alexanderplatz',
      city: 'Berlin',
      latitude: 52.522331,
      longitude: 13.41274,
      description: 'Das ist ein Beispiel-Depot',
      delivery_days: 'Montag, Dienstag, Freitag',
    },
  ])
  await knex('farms').truncate()
  await knex('farms').insert([
    {
      url: 'http://www.examplefarm.com',
      name: 'Beispiel-Farm 1',
      address: 'Brandenburger Tor',
      city: 'Berlin',
      latitude: 52.5163,
      longitude: 13.3777,
      description: 'Das ist eine Beispiel-Farm',
      accepts_new_members: 'yes',
      founded_at_year: 2014,
      founded_at_month: 3,
      maximum_members: 100,
      additional_product_information:
        'Dies sind zusätzliche Produkt-Informationen',
      participation: 'Informationen über die Mitarbeit',
      acts_ecological: true,
      economical_behavior: 'Informationen über die Wirtschaftsweise',
    },
  ])
  await knex('farms_products').truncate()
  await knex('farms_products').insert([
    {
      farm_id: 1,
      product_id: 1,
    },
    {
      farm_id: 1,
      product_id: 3,
    },
  ])
  await knex('initiatives').truncate()
  await knex('initiatives').insert([
    {
      url: 'http://www.exampleinitiative.com',
      name: 'Beispiel-Initiative 1',
      address: 'Kurfürstendamm',
      city: 'Berlin',
      latitude: 52.501629,
      longitude: 13.31891,
      description: 'Das ist die Beschreibung der Initiative',
    },
  ])
  await knex('initiatives_goals').truncate()
  await knex('initiatives_goals').insert([
    {
      initiative_id: 1,
      goal_id: 1,
    },
    {
      initiative_id: 1,
      goal_id: 2,
    },
  ])
}
