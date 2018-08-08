import crudl from '@crudlio/crudl/dist/crudl'

import SplitDateTimeField from '../fields/SplitDateTimeField'

import { list, detail, options } from '../connectors'
import { select } from '../utils'

const users = list('users')
const user = detail('users')

const roles = options('roles', 'id', 'name')

const listView = {
  path: 'users',
  title: 'Users',
  actions: {
    list(req) {
      return users.read(req)
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
    name: 'email',
    label: 'Email address',
    sortable: true
  },
  {
    name: 'isVerified',
    label: 'Verified',
    render: 'boolean',
    sortable: true
  },
  {
    name: 'origin',
    label: 'Origin',
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
      name: 'email',
      label: 'Email',
      field: 'String'
    },
    {
      name: 'isVerified',
      label: 'Verified',
      field: 'Select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]
    },
    {
      name: 'origin',
      label: 'Origin',
      field: 'Select',
      options: [
        { value: 'https://ernte-teilen.org', label: 'DE - Ernte Teilen' },
        { value: 'https://www.solawi.ch', label: 'CH - Solawi' }
      ],
      helpText: 'Name'
    }
  ]
}

const changeView = {
  path: 'users/:id',
  title: 'Edit User',
  actions: {
    get(req) {
      return user(crudl.path.id).read(req)
    },
    delete(req) {
      return user(crudl.path.id).delete(req)
    },
    save(req) {
      return user(crudl.path.id).update(req)
    }
  }
}

changeView.fieldsets = [
  {
    fields: [
      {
        name: 'name',
        label: 'Name',
        field: 'String'
      },
      {
        name: 'email',
        label: 'Email address',
        field: 'String'
      },
      {
        name: 'phone',
        label: 'Phone',
        field: 'String'
      },
      {
        name: 'isVerified',
        label: 'Verified',
        field: 'Checkbox'
      }
    ]
  },
  {
    title: 'Additional Info',
    expanded: true,
    fields: [
      {
        name: 'roles',
        label: 'Roles',
        required: false,
        getValue: select('roles[*].id'),
        field: 'SelectMultiple',
        lazy: () => roles.read(crudl.req())
      },
      {
        name: 'origin',
        label: 'Origin',
        field: 'String',
        readOnly: true
      },
      {
        name: 'baseurl',
        label: 'Base URL',
        field: 'URL',
        readOnly: true
      }
    ]
  },
  {
    title: 'Meta',
    expanded: false,
    fields: [
      {
        name: 'verifyExpires',
        label: 'Verify Token expires',
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
        name: 'resetExpires',
        label: 'Reset Token expires',
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

const addView = {
  path: 'users/new',
  title: 'Add User',
  fieldsets: changeView.fieldsets,
  actions: {
    add(req) {
      return users.create(req)
    }
  }
}

export default {
  listView,
  changeView,
  addView
}
