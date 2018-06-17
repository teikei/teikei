import path from 'path'
import glob from 'glob'
import { email, templateRoot } from './emails'

export default app => {
  app.use('/emailPreview/:name', async (req, res) => {
    res.send(await email.render(`emails/${req.params.name}/html`))
  })

  app.use('/emailPreview', async (req, res) => {
    const templates = []
    glob
      .sync(path.resolve(templateRoot, 'emails', '**/*.njk'))
      .forEach(file => {
        const url = path.relative(path.resolve(templateRoot, 'emails'), file)
        templates.push(path.dirname(url))
      })
    res.send(await email.render('index', { templates }))
  })
}
