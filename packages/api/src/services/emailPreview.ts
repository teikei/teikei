import type { Application } from '@feathersjs/express'
import type { Request, Response } from 'express'
import { glob } from 'glob'
import path from 'path'
import { sourceTemplateRoot } from './emails.ts'

export default (app: Application) => {
  app.use('/emailPreview/:template', async (req: Request, res: Response) => {
    const locale = req.query.locale || 'de-DE'
    res.send(
      await app
        .service('emails')
        .create(
          { template: req.params.template, locals: { locale } },
          { render: true }
        )
    )
  })

  app.use('/emailPreview', async (req: Request, res: Response) => {
    const locale = req.query.locale || 'de-DE'
    const templates: string[] = []
    glob
      .sync(path.resolve(sourceTemplateRoot, 'emails', '**/html.njk'))
      .filter((t) => !t.endsWith('index/html.njk'))
      .forEach((file) => {
        const url = path.relative(
          path.resolve(sourceTemplateRoot, 'emails'),
          file
        )
        templates.push(path.dirname(url))
      })
    res.send(
      await app
        .service('emails')
        .create(
          { locals: { locale, templates }, template: 'index' },
          { render: true }
        )
    )
  })
}
