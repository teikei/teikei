import { disallow } from 'feathers-hooks-common'
import Email from 'email-templates'
import path from 'path'
import nunjucks from 'nunjucks'

const templateRoot = path.resolve(__dirname, '../templates')

const email = new Email({
  message: {
    from: 'info@ernte-teilen.de'
  },
  views: {
    root: templateRoot,
    options: {
      extension: 'njk'
    }
  },
  transport: {
    jsonTransport: true
  }
})

nunjucks.configure(templateRoot, {})

export default app => {
  const service = {
    create: async data => {
      if (!email.templateExists(`${data.template}/html`)) {
        throw new Error(`missing html template for ${data.template}`)
      }
      await email.send(data)
    }
  }

  app.use('/emails', service)

  app.service('emails').hooks({
    before: {
      all: [disallow('external')],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  })
}
