// TODO why is this a function?
const defaultConfig = () => ({
  country: 'DE',
  countries: {
    DE: {
      center: {
        lat: 51.1657,
        lon: 10.4515
      },
      zoom: 6
    },
    CH: {
      center: {
        lat: 46.8182,
        lon: 8.2275
      },
      zoom: 8
    }
  },
  padding: [0, 170],
  zoom: {
    default: 8,
    min: 6,
    max: 15,
    searchResult: 14
  },
  mapTilesUrl: process.env.REACT_APP_MAP_TILES_URL,
  mapStaticUrl: process.env.REACT_APP_MAP_STATIC_URL,
  apiKey: process.env.REACT_APP_MAP_API_KEY,
  baseUrl: '/#',
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3030',
  assetsBaseUrl: '/assets',
  externalHelpUrl: ''
})

export default userConfig =>
  Object.freeze({ ...defaultConfig(), ...userConfig })
