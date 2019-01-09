import crudl from '@crudlio/crudl/dist/crudl'
import { Ability } from '@casl/ability'

import { list, detail } from '../connectors'

const depots = list('goals')
const depot = detail('goals')

const listView = {
  path: 'goals',
  title: 'Goals',
  actions: {
    async list(req) {
      return depots.read(req)
    }
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      list: ability.can('read', 'admin/menu/goals')
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
      name: 'name$like',
      label: 'Name',
      field: 'String',
      helpText: 'Name'
    }
  ]
}

const changeView = {
  path: 'goals/:id',
  title: 'Goal',
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
      get: ability.can('read', 'admin/goals'),
      save: ability.can('update', 'admin/goals'),
      delete: ability.can('delete', 'admin/goals')
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
      }
    ]
  }
]

export default {
  listView,
  changeView
}
