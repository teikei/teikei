export default (app) => {
  const service = {
    find: async (params) => {
      return {
        total: app.jobs.length,
        limit: app.jobs.length,
        skip: 0,
        data: app.jobs.map((j, id) => ({ id, ...j })),
      }
    },
    get: async (id, params) => {
      return app.jobs[id]
    },
  }

  app.use('/admin/jobs', service)
  app.service('/admin/jobs').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  })
}
