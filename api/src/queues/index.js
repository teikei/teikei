import refreshSearchIndex from './refreshSearchIndex'
import arena from './arena'

export default app => {
  app.configure(refreshSearchIndex)
  app.configure(arena)
}
