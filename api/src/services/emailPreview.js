import path from 'path'
import glob from 'glob'
import { sourceTemplateRoot } from './emails'

export default app => {
  app.use('/emailPreview/:template', async (req, res) => {
    res.send(
      await app
        .service('emails')
        .create(
          { template: `emails/${req.params.template}/html` },
          { render: true }
        )
    )
  })

  app.use('/emailPreview', async (req, res) => {
    const templates = []
    glob
      .sync(path.resolve(sourceTemplateRoot, 'emails', '**/*.njk'))
      .forEach(file => {
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
