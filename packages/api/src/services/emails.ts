import type { Application, Params } from '@feathersjs/feathers'
import Email from 'email-templates'
import { disallow } from 'feathers-hooks-common'
import fs from 'fs'
import { glob } from 'glob'
import inky from 'inky'
import nodemailer from 'nodemailer'
import postmarkTransport from 'nodemailer-postmark-transport'
import nunjucks from 'nunjucks'
import path from 'path'
import { setEmailTemplateOriginLocals } from '../hooks/email.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.ts'
import { logger } from '../logger.ts'

// The typings declare an ES default export, but Node hands the CommonJS
// module.exports, which is that function, to the default import.
const createPostmarkTransport =
  postmarkTransport as unknown as typeof postmarkTransport.default

export const sourceTemplateRoot = path.resolve(
  import.meta.dirname,
  '..',
  '..',
  'src',
  'templates'
)

const compiledTemplateRoot = path.resolve(
  import.meta.dirname,
  '..',
  '..',
  'build',
  'templates'
)

const i18nResourcesRoot = path.resolve(import.meta.dirname, '..', 'locales')

const compileTemplates = () => {
  glob.sync(path.resolve(sourceTemplateRoot, '**/*.njk')).forEach((file) => {
    const dirname = path.dirname(file)
    inky({
      src: path.resolve(dirname, '*.njk'),
      dest: path.resolve(
        compiledTemplateRoot,
        path.relative(sourceTemplateRoot, dirname)
      )
    })
  })
  logger.info('Email templates compiled successfully.')
}

type EmailData = {
  template: string
  message?: object
  locals?: Record<string, unknown>
}

export default (app: Application) => {
  const mailerConfig = app.get('mailer')

  const options = {
    ...mailerConfig.nodemailerOptions,
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
    },
    i18n: {
      directory: i18nResourcesRoot,
      locales: ['de-CH', 'de-DE', 'fr-CH'],
      defaultLocale: 'de-DE'
    }
  }

  if (app.isProduction() && mailerConfig.transport === 'postmarkTransport') {
    logger.info(
      'activating Postmark mailer - PRODUCTION MODE. Emails will be delivered to recipients.'
    )
    options.transport = nodemailer.createTransport(
      createPostmarkTransport(mailerConfig.postmarkTransport)
    )
  } else if (
    app.isProduction() &&
    mailerConfig.transport === 'postmarkSandboxTransport'
  ) {
    logger.info(
      'activating Postmark mailer - SANDBOX MODE. Emails will be delivered to Postmark Sandbox.'
    )
    options.transport = nodemailer.createTransport(
      createPostmarkTransport(mailerConfig.postmarkSandboxTransport)
    )
  } else if (
    process.env.NODE_ENV === 'test' &&
    mailerConfig.transport === 'jsonTransport'
  ) {
    logger.info(
      'activating JSON mailer - TEST MODE. Emails will not be delivered.'
    )
    options.transport = nodemailer.createTransport({ jsonTransport: true })
  } else {
    logger.info(
      'activating Ethereal mailer - TEST MODE. Emails will not be delivered to recipients.'
    )
    options.transport = nodemailer.createTransport(
      mailerConfig.etherealTransport
    )
  }

  const email = new Email(options)

  const service = {
    create: async (data: EmailData, params: Params) => {
      const template = `emails/${data.template}`
      const exists = await email.templateExists(`${template}/html`)
      if (!exists) {
        throw new Error(`missing html template for ${data.template}`)
      }
      if (params.render) {
        const templateMeta = JSON.parse(
          fs.readFileSync(
            path.resolve(sourceTemplateRoot, template, 'metadata.json'),
            'utf8'
          )
        )
        return email.render(`${template}/html`, {
          ...templateMeta.testData,
          ...data.locals
        })
      }
      return email.send({
        ...data,
        locals: { ...data.locals },
        template
      })
    },
    setup: async () => {
      compileTemplates()
      nunjucks.configure(compiledTemplateRoot, {})
    }
  }

  app.use('/emails', service)

  app.service('emails').hooks({
    before: {
      create: [disallow('external'), setEmailTemplateOriginLocals]
    },
    after: {
      create: [filterAllowedFields]
    }
  })
}
