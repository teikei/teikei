import crudl from '@crudlio/crudl/dist/crudl'
import { Ability } from '@casl/ability'

import { list, detail } from '../connectors'

const products = list('products')
const product = detail('products')

const categoryOptions = [
  { value: 'vegetable_products', label: 'Vegetable Products' },
  { value: 'animal_products', label: 'Animal Products' },
  { value: 'beverages', label: 'Beverages' }
]

const listView = {
  path: 'products',
  title: 'Products',
  actions: {
    async list(req) {
      return products.read(req)
    }
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      list: ability.can('read', 'admin/menu/products')
    }
  }
}

listView.fields = [
  {
    name: 'id',
    label: 'ID',
    sorted: 'ascending',
    sortable: true
  },
  {
    name: 'category',
    label: 'Category',
    getValue: p => categoryOptions.find(c => c.value === p.category).label,
    sortable: true
  },
  {
    name: 'name',
    label: 'Name',
    main: true,
    sortable: true
  }
]

listView.filters = {
  fields: [
    {
      name: 'category',
      label: 'Category',
      field: 'Select',
      required: true,
      options: categoryOptions
    },
    {
      name: 'name$like',
      label: 'Name',
      field: 'String',
      required: true
    }
  ]
}

const changeView = {
  path: 'products/:id',
  title: 'Product',
  actions: {
    get(req) {
      return product(crudl.path.id).read(req)
    },
    delete(req) {
      return product(crudl.path.id).delete(req)
    },
    save(req) {
      return product(crudl.path.id).update(req)
    }
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      get: ability.can('read', 'admin/products'),
      save: ability.can('update', 'admin/products'),
      delete: ability.can('delete', 'admin/products')
    }
  }
}

changeView.fieldsets = [
  {
    fields: [
      {
        name: 'id',
        label: 'ID',
        readOnly: true,
        field: 'String'
      },
      {
        name: 'name',
        label: 'Name',
        field: 'String'
      },
      {
        name: 'category',
        label: 'Category',
        required: false,
        field: 'Select',
        options: categoryOptions
      }
    ]
  }
]

export default {
  listView,
  changeView
}
