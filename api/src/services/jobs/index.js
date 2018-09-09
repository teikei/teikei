import searchIndex from './buildSearchIndex'
import networks from './populateNetworks'

export default app => {
  app.configure(searchIndex)
  app.configure(networks)
}
