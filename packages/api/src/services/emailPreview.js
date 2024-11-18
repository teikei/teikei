import path from 'path'
import { glob } from 'glob'
import { sourceTemplateRoot } from './emails'

export default (app) => {
  app.use('/emailPreview/:template', async (req, res) => {
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

  app.use('/emailPreview', async (req, res) => {
    const templates = []
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
        .create({ locals: { templates }, template: 'index' }, { render: true })
    )
  })
}
