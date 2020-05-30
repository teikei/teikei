import refreshSearchIndex from './refreshSearchIndex'
import reverseGeocode from './reverseGeocode'
import arena from './arena'

export default (app) => {
  app.configure(refreshSearchIndex)
  app.configure(reverseGeocode)
  app.configure(arena)
}
