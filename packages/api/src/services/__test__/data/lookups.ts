// The lookup records db/seeds inserts, as the API returns them.

export const products = [
  ['vegetable_products', 'vegetables'],
  ['vegetable_products', 'fruits'],
  ['vegetable_products', 'mushrooms'],
  ['vegetable_products', 'cereals'],
  ['vegetable_products', 'bread_and_pastries'],
  ['vegetable_products', 'spices'],
  ['animal_products', 'eggs'],
  ['animal_products', 'meat'],
  ['animal_products', 'sausages'],
  ['animal_products', 'milk'],
  ['animal_products', 'dairy'],
  ['animal_products', 'fish'],
  ['animal_products', 'honey'],
  ['beverages', 'juice'],
  ['beverages', 'wine'],
  ['beverages', 'beer']
].map(([category, name], index) => ({
  id: `${index + 1}`,
  category,
  name,
  type: 'Product',
  link: `/products/${index + 1}`
}))

export const goals = ['land', 'staff', 'organizers', 'consumers'].map(
  (name, index) => ({
    id: `${index + 1}`,
    name,
    type: 'Goal',
    link: `/goals/${index + 1}`
  })
)

export const badges = [
  {
    id: '1',
    name: 'Agriculture Association',
    category: 'associations',
    country: 'DEU',
    url: 'http://www.agriculture.com',
    logo: '/agriculture.png',
    type: 'Badge',
    link: '/badges/1'
  },
  {
    id: '2',
    name: 'Organic Foo Certification',
    category: 'certifications',
    country: 'DEU',
    url: 'http://www.organic.com',
    logo: '/organic.png',
    type: 'Badge',
    link: '/badges/2'
  }
]

export const roles = ['user', 'admin', 'superadmin'].map((name, index) => ({
  id: `${index + 1}`,
  name,
  type: 'Role',
  link: `/roles/${index + 1}`
}))

export const origins = [
  {
    id: '1',
    origin: 'http://localhost:3000',
    baseurl: '/#',
    originName: 'Teikei',
    organizationName: 'Teikei Example Organization',
    organizationEmail: 'superadmin@example.com',
    type: 'Origin',
    link: '/origins/1'
  },
  {
    id: '2',
    origin: 'http://localhost:4000',
    baseurl: '/#',
    originName: 'Teikei 2',
    organizationName: 'Teikei 2 Example Organization',
    organizationEmail: 'superadmin@example.com',
    type: 'Origin',
    link: '/origins/2'
  }
]
