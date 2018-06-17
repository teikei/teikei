import { disallow } from 'feathers-hooks-common'
import Email from 'email-templates'
import path from 'path'
import inky from 'inky'
import nunjucks from 'nunjucks'
import glob from 'glob'

export const templateRoot = path.resolve('src', 'templates')
const compiledTemplateRoot = path.resolve('build', 'templates')

export const email = new Email({
  message: {
    from: 'info@ernte-teilen.de'
  },
  views: {
    root: compiledTemplateRoot,
    options: {
      extension: 'njk'
    }
  },
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: templateRoot
    }
  },
  transport: {
    jsonTransport: true
  }
})

nunjucks.configure(compiledTemplateRoot, {})

const compileTemplates = app => {
  glob.sync(path.resolve(templateRoot, '**/*.njk')).forEach(file => {
    const dirname = path.dirname(file)
    inky({
      src: path.resolve(dirname, '*.njk'),
      dest: path.resolve(
        compiledTemplateRoot,
        path.relative(templateRoot, dirname)
      )
    })
  })
  app.info('Email templates compiled successfully.')
}

export default app => {
  const service = {
    create: async data => {
      const template = `emails/${data.template}`
      if (!email.templateExists(`${template}/html`)) {
        throw new Error(`missing html template for ${data.template}`)
      }
      await email.send({ ...data, template })
    },
    setup: async a => {
      compileTemplates(a)
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
