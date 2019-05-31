import crudl from '@crudlio/crudl/dist/crudl'
import { Ability } from '@casl/ability'

import { list, detail, options } from '../connectors'
import SplitDateTimeField from '../fields/SplitDateTimeField'
import { select } from '../utils'

const depots = list('depots')
const depot = detail('depots')

const farms = options('farms', 'id', 'name')
const users = options('users', 'id', 'name')

const listView = {
  path: 'depots',
  title: 'Depots',
  actions: {
    async list(req) {
      return depots.read(req)
    }
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      list: ability.can('read', 'admin/menu/depots')
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
      name: 'name$ilike',
      label: 'Name',
      field: 'String'
    },
    {
      name: 'address$ilike',
      label: 'Address',
      field: 'String'
    },
    {
      name: 'city$ilike',
      label: 'City',
      field: 'String'
    },
    {
      name: 'state$ilike',
      label: 'State',
      field: 'String'
    },
    {
      name: 'country',
      label: 'Country',
      field: 'Select',
      options: [
        { value: 'DEU', label: 'Germany' },
        { value: 'AUT', label: 'Austria' },
        { value: 'CHE', label: 'Switzerland' },
        { value: 'LIE', label: 'Liechtenstein' }
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
  path: 'depots/:id',
  title: 'Depot',
  actions: {
    get(req) {
      return depot(crudl.path.id).read(req)
    },
    delete(req) {
      return depot(crudl.path.id).delete(req)
    },
    save(req) {
      return depot(crudl.path.id).update(req)
    }
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      get: ability.can('read', 'admin/depots'),
      save: ability.can('update', 'admin/depots'),
      delete: ability.can('delete', 'admin/depots')
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
        name: 'active',
        label: 'Active',
        required: true,
        field: 'Checkbox'
      },
      {
        name: 'address',
        label: 'Address',
        field: 'String'
      },
      {
        name: 'city',
        label: 'City',
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
          { value: 'AUT', label: 'Austria' },
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
        name: 'deliveryDays',
        label: 'Delivery Days',
        field: 'String'
      },
      {
        name: 'farms',
        label: 'Farms',
        required: false,
        getValue: select('farms[*].id'),
        field: 'SelectMultiple',
        lazy: () => farms.read(crudl.req())
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
