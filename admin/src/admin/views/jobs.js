import crudl from '@crudlio/crudl/dist/crudl'
import { Ability } from '@casl/ability'

import { list, detail } from '../connectors'

const jobs = list('jobs')
const job = detail('jobs')

const listView = {
  path: 'jobs',
  title: 'CRON Jobs',
  actions: {
    async list(req) {
      return jobs.read(req)
    },
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      list: ability.can('read', 'admin/menu/jobs'),
    }
  },
}

listView.fields = [
  {
    name: 'id',
    label: 'ID',
    main: true,
    sorted: 'ascending',
    sortable: true,
  },
  {
    name: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    name: 'cron',
    label: 'CRON',
    sortable: false,
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
  path: 'jobs/:id',
  title: 'Job',
  actions: {
    get(req) {
      return job(crudl.path.id).read(req)
    },
    delete(req) {
      return job(crudl.path.id).delete(req)
    },
    save(req) {
      return job(crudl.path.id).update(req)
    },
  },
  permissions: () => {
    const ability = new Ability(crudl.auth.abilities)
    return {
      get: ability.can('read', 'admin/badges'),
      save: false,
      delete: false,
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
        readOnly: true,
        field: 'String',
      },
      {
        name: 'cron',
        label: 'CRON',
        readOnly: true,
        field: 'String',
      },
    ],
  },
]

export default {
  listView,
  changeView,
}
