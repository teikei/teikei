import { disallow } from 'feathers-hooks-common'
import Email from 'email-templates'
import path from 'path'
import inky from 'inky'
import nunjucks from 'nunjucks'
import nodemailer from 'nodemailer'
import postmarkTransport from 'nodemailer-postmark-transport'
import glob from 'glob'
import filterAllowedFields from '../hooks/filterAllowedFields'

export const sourceTemplateRoot = path.resolve(
  __dirname,
  '..',
  '..',
  'src',
  'templates'
)

const compiledTemplateRoot = path.resolve(
  __dirname,
  '..',
  '..',
  'build',
  'templates'
)

const compileTemplates = (app) => {
  glob.sync(path.resolve(sourceTemplateRoot, '**/*.njk')).forEach((file) => {
    const dirname = path.dirname(file)
    inky({
      src: path.resolve(dirname, '*.njk'),
      dest: path.resolve(
        compiledTemplateRoot,
        path.relative(sourceTemplateRoot, dirname)
      ),
    })
  })
  app.info('Email templates compiled successfully.')
}

export default (app) => {
  const mailerConfig = app.get('mailer')

  const options = {
    ...mailerConfig.nodemailerOptions,
    views: {
      root: compiledTemplateRoot,
      options: {
        extension: 'njk',
      },
    },
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: sourceTemplateRoot,
      },
    },
  }

  if (app.isProduction() && mailerConfig.deliverEmails === 'true') {
    app.info(
      'activating postmark mailer - PRODUCTION MODE. emails will be delivered to recipients.'
    )
    options.transport = nodemailer.createTransport(
      postmarkTransport(mailerConfig.postmarkTransport)
    )
  } else {
    app.info(
      'activating ethereal mailer - TEST MODE. emails will not be delivered to recipients.'
    )
    options.transport = nodemailer.createTransport(
      mailerConfig.etherealTransport
    )
  }

  const email = new Email(options)

  const service = {
    create: async (data) => {
      const template = `emails/${data.template}`
      if (!email.templateExists(`${template}/html`)) {
        throw new Error(`missing html template for ${data.template}`)
      }
      return email.send({ ...data, template })
    },
    setup: async (a) => {
      compileTemplates(a)
      nunjucks.configure(compiledTemplateRoot, {})
    },
  }

  app.use('/emails', service)

  app
    .service('emails')
    .hooks({
      before: {
        all: [disallow('external')],
        create: [],
      },
      after: {
        all: [],
        create: [],
      },
      error: {
        all: [],
        create: [],
      },
    })
    .hooks({
      after: {
        all: [filterAllowedFields],
      },
    })
}
