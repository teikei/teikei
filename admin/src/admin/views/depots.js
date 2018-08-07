import React from 'react'
import crudl from '@crudlio/crudl/dist/crudl'

import { list, detail, options } from '../connectors'
import SplitDateTimeField from '../fields/SplitDateTimeField'

const depots = list('depots')
const depot = detail('depots')

const listView = {
  path: 'depots',
  title: 'Depots',
  actions: {
    async list(req) {
      return depots.read(req)
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
      }
    ]
  },
  {
    title: 'Additional Info',
    expanded: true,
    fields: [
      {
        name: 'deliveryDays',
        label: 'Delivery Days',
        field: 'String'
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

const addView = {
  path: 'categories/new',
  title: 'New Category',
  fieldsets: changeView.fieldsets,
  actions: {
    add(req) {
      return null //categories.create(req)
    }
  }
}

export default {
  listView,
  changeView,
  addView
}
