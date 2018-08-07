import React from 'react'
import crudl from '@crudlio/crudl/dist/crudl'

import SplitDateTimeField from '../fields/SplitDateTimeField'

import { list, detail, options } from '../connectors'

const users = list('users')
const user = detail('users')

const listView = {
  path: 'users',
  title: 'Users',
  actions: {
    list(req) {
      return users.read(req)
      // return userss.read(req.filter('_id', crudl.auth.user))
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
      name: 'name',
      label: 'Name',
      field: 'String',
      helpText: 'Name'
    },
    {
      name: 'email',
      label: 'Email',
      field: 'String',
      helpText: 'Name'
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
  actions: {
    add(req) {
      return users.create(req)
    }
  }
}

addView.fieldsets = [
  {
    fields: [
      {
        name: 'username',
        label: 'Username',
        field: 'String'
      }
    ]
  },
  {
    fields: [
      {
        name: 'first_name',
        label: 'Name',
        field: 'String'
      },
      {
        name: 'last_name',
        label: 'Last Name',
        field: 'String'
      },
      {
        name: 'email',
        label: 'Email address',
        field: 'String'
      }
    ]
  },
  {
    title: 'Roles',
    expanded: true,
    fields: [
      {
        name: 'is_active',
        label: 'Active',
        field: 'Checkbox',
        initialValue: true,
        helpText:
          'Designates whether this user should be treated as active. Unselect this instead of deleting accounts.'
      },
      {
        name: 'is_staff',
        label: 'Staff member',
        field: 'Checkbox',
        helpText: 'Designates whether the user can log into crudl.'
      }
    ]
  },
  {
    title: 'Password',
    expanded: true,
    fields: [
      {
        name: 'password',
        label: 'Password',
        field: 'Password'
      },
      {
        name: 'password_confirm',
        label: 'Password (Confirm)',
        field: 'Password',
        validate: (value, allValues) => {
          if (value !== allValues.password) {
            return 'The passwords do not match.'
          }
        }
      }
    ]
  }
]

export default {
  listView,
  changeView,
  addView
}
