import { disallow } from 'feathers-hooks-common'
import Email from 'email-templates'
import path from 'path'
import inky from 'inky'
import nunjucks from 'nunjucks'
import nodemailer from 'nodemailer'
import sparkPostTransport from 'nodemailer-sparkpost-transport'
import glob from 'glob'

export const sourceTemplateRoot = path.resolve('src', 'templates')
const compiledTemplateRoot = path.resolve('build', 'templates')

const compileTemplates = app => {
  glob.sync(path.resolve(sourceTemplateRoot, '**/*.njk')).forEach(file => {
    const dirname = path.dirname(file)
    inky({
      src: path.resolve(dirname, '*.njk'),
      dest: path.resolve(
        compiledTemplateRoot,
        path.relative(sourceTemplateRoot, dirname)
      )
    })
  })
  app.info('Email templates compiled successfully.')
}

export default app => {
  const options = {
    ...app.get('mailer'),
    views: {
      root: compiledTemplateRoot,
      options: {
        extension: 'njk'
      }
    },
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: sourceTemplateRoot
      }
    }
  }

  if (options.transport.sparkpost) {
    app.info('activating sparkpost mailer')
    options.transport = nodemailer.createTransport(
      sparkPostTransport(options.transport.sparkpost)
    )
  }

  const email = new Email(options)

  const service = {
    create: async (data, params) => {
      if (params.render) {
        return email.render(data.template, data.locals)
      }
      const template = `emails/${data.template}`
      if (!email.templateExists(`${template}/html`)) {
        throw new Error(`missing html template for ${data.template}`)
      }
      // const renderedMessage = await email.render(template, data.locals)
      // console.log("renderedMessage", renderedMessage);
      return email.send({ ...data, template })
    },
    setup: async a => {
      compileTemplates(a)
      nunjucks.configure(compiledTemplateRoot, {})
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