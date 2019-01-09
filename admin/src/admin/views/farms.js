import crudl from '@crudlio/crudl/dist/crudl'
import { Ability } from '@casl/ability'

import { list, detail, options } from '../connectors'
import SplitDateTimeField from '../fields/SplitDateTimeField'
import { select } from '../utils'

const farms = list('farms')
const farm = detail('farms')

const depots = options('depots', 'id', 'name')
const products = options('products', 'id', 'name')
const users = options('users', 'id', 'name')

const listView = {
  path: 'farms',
  title: 'Farms',
  actions: {
    async list(req) {
      return farms.read(req)
    }
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      list: ability.can('read', 'admin/menu/farms')
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
    name: 'active',
    label: 'Active',
    render: 'boolean',
    sortable: true
  },
  {
    name: 'name',
    label: 'Name',
    main: true,
    sortable: true
  },
  {
    name: 'city',
    label: 'City',
    sortable: true
  },
  {
    name: 'state',
    label: 'State',
    sortable: true
  },
  {
    name: 'country',
    label: 'Country',
    sortable: true
  }
]

listView.filters = {
  fields: [
    {
      name: 'id',
      label: 'ID',
      field: 'String'
    },
    {
      name: 'name$like',
      label: 'Name',
      field: 'String'
    },
    {
      name: 'address$like',
      label: 'Address',
      field: 'String'
    },
    {
      name: 'city$like',
      label: 'City',
      field: 'String'
    },
    {
      name: 'state$like',
      label: 'State',
      field: 'String'
    },
    {
      name: 'country',
      label: 'Country',
      field: 'Select',
      options: [
        { value: 'DEU', label: 'Germany' },
        { value: 'CHE', label: 'Switzerland' },
        { value: 'LIE', label: 'Liechtenstein' }
      ]
    },
    {
      name: 'acceptsNewMembers',
      label: 'Accepts New Members',
      field: 'Select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'waitlist', label: 'Waitlist' }
      ]
    },
    {
      name: 'actsEcological',
      label: 'Acts Ecologically',
      field: 'Select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]
    },
    {
      name: 'active',
      label: 'Active',
      field: 'Select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]
    }
  ]
}

const changeView = {
  path: 'farms/:id',
  title: 'Farm',
  actions: {
    get(req) {
      return farm(crudl.path.id).read(req)
    },
    delete(req) {
      return farm(crudl.path.id).delete(req)
    },
    save(req) {
      return farm(crudl.path.id).update(req)
    }
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      get: ability.can('read', 'admin/farms'),
      save: ability.can('update', 'admin/farms'),
      delete: ability.can('delete', 'admin/farms')
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
        required: true,
        field: 'String'
      },
      {
        name: 'name',
        label: 'Name',
        required: true,
        field: 'String'
      },
      {
        name: 'active',
        label: 'Active',
        required: true,
        field: 'Checkbox'
      },
      {
        name: 'address',
        label: 'Address',
        required: true,
        field: 'String'
      },
      {
        name: 'city',
        label: 'City',
        required: true,
        field: 'String'
      },
      {
        name: 'state',
        label: 'State',
        field: 'String'
      },
      {
        name: 'country',
        label: 'Country',
        field: 'Select',
        options: [
          { value: 'DEU', label: 'Germany' },
          { value: 'CHE', label: 'Switzerland' },
          { value: 'LIE', label: 'Liechtenstein' }
        ]
      },
      {
        name: 'url',
        label: 'URL',
        link: true,
        field: 'URL'
      },
      {
        name: 'description',
        label: 'Description',
        field: 'Textarea'
      },
      {
        name: 'acceptsNewMembers',
        label: 'Accepts New Members',
        field: 'Select',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'waitlist', label: 'Waitlist' }
        ]
      },
      {
        name: 'foundedAtYear',
        label: 'Foundet At Year',
        field: 'String'
      },
      {
        name: 'foundedAtMonth',
        label: 'Foundet At Month',
        field: 'String'
      },
      {
        name: 'maximumMembers',
        label: 'Maximum Members',
        field: 'String'
      },
      {
        name: 'additionalProductInformation',
        label: 'Additional Product Information',
        field: 'String'
      },
      {
        name: 'participation',
        label: 'Participation',
        field: 'Textarea'
      },
      {
        name: 'actsEcological',
        label: 'Acts Ecologically',
        field: 'Checkbox'
      },
      {
        name: 'economicalBehavior',
        label: 'Economical Behavior',
        field: 'Textarea'
      },
      {
        name: 'products',
        label: 'Products',
        required: false,
        getValue: select('products[*].id'),
        field: 'SelectMultiple',
        lazy: () => products.read(crudl.req())
      },
      {
        name: 'depots',
        label: 'Depots',
        required: false,
        getValue: select('depots[*].id'),
        field: 'SelectMultiple',
        lazy: () => depots.read(crudl.req())
      },
      {
        name: 'ownerships',
        label: 'Owner',
        required: true,
        getValue: select('ownerships[*].id'),
        field: 'SelectMultiple',
        lazy: () => users.read(crudl.req())
      }
    ]
  },
  {
    title: 'Meta',
    expanded: false,
    fields: [
      {
        name: 'latitude',
        label: 'Latitude',
        readOnly: true,
        field: 'String'
      },
      {
        name: 'longitude',
        label: 'Longitude',
        readOnly: true,
        field: 'String'
      },
      {
        name: 'createdAt',
        label: 'Created At',
        readOnly: true,
        field: SplitDateTimeField,
        getTime: date => {
          const T = date.indexOf('T')
          return date.slice(T + 1, T + 6)
        },
        getDate: date => {
          const T = date.indexOf('T')
          return date.slice(0, T)
        }
      },
      {
        name: 'updatedAt',
        label: 'Updated At',
        readOnly: true,
        field: SplitDateTimeField,
        getTime: date => {
          const T = date.indexOf('T')
          return date.slice(T + 1, T + 6)
        },
        getDate: date => {
          const T = date.indexOf('T')
          return date.slice(0, T)
        }
      }
    ]
  }
]

export default {
  listView,
  changeView
}
