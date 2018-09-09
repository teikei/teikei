import populateNetworks from './populateNetworks'
import refreshSearchIndex from './refreshSearchIndex'
import arena from './arena'

export default app => {
  app.configure(populateNetworks)
  app.configure(refreshSearchIndex)

  app.configure(arena)
}
