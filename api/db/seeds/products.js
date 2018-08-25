exports.seed = async knex => {
  await knex('products').del()
  await knex('products').insert([
    {
      id: 1,
      category: 'vegetable_products',
      name: 'vegetables'
    },
    {
      id: 2,
      category: 'vegetable_products',
      name: 'fruits'
    },
    {
      id: 3,
      category: 'vegetable_products',
      name: 'mushrooms'
    },
    {
      id: 4,
      category: 'vegetable_products',
      name: 'cereals'
    },
    {
      id: 5,
      category: 'vegetable_products',
      name: 'bread_and_pastries'
    },
    {
      id: 6,
      category: 'vegetable_products',
      name: 'spices'
    },
    {
      id: 7,
      category: 'animal_products',
      name: 'eggs'
    },
    {
      id: 8,
      category: 'animal_products',
      name: 'meat'
    },
    {
      id: 9,
      category: 'animal_products',
      name: 'sausages'
    },
    {
      id: 10,
      category: 'animal_products',
      name: 'milk'
    },
    {
      id: 11,
      category: 'animal_products',
      name: 'dairy'
    },
    {
      id: 12,
      category: 'animal_products',
      name: 'fish'
    },
    {
      id: 13,
      category: 'animal_products',
      name: 'honey'
    },
    {
      id: 14,
      category: 'beverages',
      name: 'juice'
    },
    {
      id: 15,
      category: 'beverages',
      name: 'wine'
    },
    {
      id: 16,
      category: 'beverages',
      name: 'beer'
    }
  ])
}
