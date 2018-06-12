import geocoder from './services/geocoder'
import autocomplete from './services/autocomplete'

export default app => {
  app.configure(geocoder)
  app.configure(autocomplete)
}
