import crudl from '@crudlio/crudl/dist/crudl'
import { Ability } from '@casl/ability'

import { list, detail } from '../connectors'

const badges = list('badges')
const badge = detail('badges')

const listView = {
  path: 'badges',
  title: 'Badges',
  actions: {
    async list(req) {
      return badges.read(req)
    },
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      list: ability.can('read', 'admin/menu/badges'),
    }
  },
}

listView.fields = [
  {
    name: 'id',
    label: 'ID',
    sorted: 'ascending',
    sortable: true,
  },
  {
    name: 'name',
    label: 'Name',
    main: true,
    sortable: true,
  },
  {
    name: 'category',
    label: 'Category',
    sortable: true,
  },
  {
    name: 'country',
    label: 'Country',
    sortable: true,
  },
  {
    name: 'logo',
    label: 'Logo',
    sortable: true,
  },
  {
    name: 'url',
    label: 'Website',
    sortable: true,
  },
]

listView.filters = {
  fields: [
    {
      name: 'name$ilike',
      label: 'Name',
      field: 'String',
      helpText: 'Name',
    },
  ],
}

const changeView = {
  path: 'badges/:id',
  title: 'Badge',
  actions: {
    get(req) {
      return badge(crudl.path.id).read(req)
    },
    delete(req) {
      return badge(crudl.path.id).delete(req)
    },
    save(req) {
      return badge(crudl.path.id).update(req)
    },
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      get: ability.can('read', 'admin/badges'),
      save: ability.can('update', 'admin/badges'),
      delete: ability.can('delete', 'admin/badges'),
    }
  },
}

changeView.fieldsets = [
  {
    fields: [
      {
        name: 'id',
        label: 'ID',
        readOnly: true,
        field: 'String',
      },
      {
        name: 'name',
        label: 'Name',
        field: 'String',
      },
      {
        name: 'category',
        label: 'Category',
        field: 'String',
      },
      {
        name: 'country',
        label: 'Country',
        field: 'String',
      },
      {
        name: 'logo',
        label: 'Logo',
        field: 'String',
      },
      {
        name: 'url',
        label: 'Website',
        field: 'String',
        link: true,
      },
    ],
  },
]

export default {
  listView,
  changeView,
}
