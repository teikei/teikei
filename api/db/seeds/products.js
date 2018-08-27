exports.seed = async knex => {
  await knex('products').del()
  await knex('products').insert([
    {
      category: 'vegetable_products',
      name: 'vegetables'
    },
    {
      category: 'vegetable_products',
      name: 'fruits'
    },
    {
      category: 'vegetable_products',
      name: 'mushrooms'
    },
    {
      category: 'vegetable_products',
      name: 'cereals'
    },
    {
      category: 'vegetable_products',
      name: 'bread_and_pastries'
    },
    {
      category: 'vegetable_products',
      name: 'spices'
    },
    {
      category: 'animal_products',
      name: 'eggs'
    },
    {
      category: 'animal_products',
      name: 'meat'
    },
    {
      category: 'animal_products',
      name: 'sausages'
    },
    {
      category: 'animal_products',
      name: 'milk'
    },
    {
      category: 'animal_products',
      name: 'dairy'
    },
    {
      category: 'animal_products',
      name: 'fish'
    },
    {
      category: 'animal_products',
      name: 'honey'
    },
    {
      category: 'beverages',
      name: 'juice'
    },
    {
      category: 'beverages',
      name: 'wine'
    },
    {
      category: 'beverages',
      name: 'beer'
    }
  ])
}
