import React from 'react'
import crudl from '@crudlio/crudl/dist/crudl'

import { list, detail } from '../connectors'
import SplitDateTimeField from '../fields/SplitDateTimeField'

const farms = list('farms')
const farm = detail('farms')

const listView = {
  path: 'farms',
  title: 'Farms',
  actions: {
    async list(req) {
      return farms.read(req)
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

// TODO we need to use snake case here, even though API has been changed to
// use camel case..
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
    },
    {
      name: 'accepts_new_members',
      label: 'Accepts New Members',
      field: 'Select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'waitlist', label: 'Waitlist' }
      ]
    },
    {
      name: 'acts_ecological',
      label: 'Acts Ecologically',
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
