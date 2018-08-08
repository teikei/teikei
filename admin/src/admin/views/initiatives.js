import crudl from '@crudlio/crudl/dist/crudl'

import { list, detail, options } from '../connectors'
import SplitDateTimeField from '../fields/SplitDateTimeField'
import { select } from '../utils'

const initiatives = list('initiatives')
const initiative = detail('initiatives')

const users = options('users', 'id', 'name')
const goals = options('goals', 'id', 'name')

const listView = {
  path: 'initiatives',
  title: 'Initiatives',
  actions: {
    async list(req) {
      return initiatives.read(req)
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
    name: 'name',
    label: 'Name',
    main: true,
    sortable: true
  },
  {
    name: 'address',
    label: 'Address',
    sortable: true
  },
  {
    name: 'city',
    label: 'City',
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
      name: 'name',
      label: 'Name',
      field: 'String'
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
    }
  ]
}

const changeView = {
  path: 'initiatives/:id',
  title: 'Edit Initiative',
  actions: {
    get: req => initiative(crudl.path.id).read(req),
    delete: req => initiative(crudl.path.id).delete(req),
    save: req => initiative(crudl.path.id).update(req)
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
    title: 'Additional Info',
    expanded: true,
    fields: [
      {
        name: 'goals',
        label: 'Goals',
        required: false,
        getValue: select('goals[*].id'),
        field: 'SelectMultiple',
        lazy: () => goals.read(crudl.req())
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
