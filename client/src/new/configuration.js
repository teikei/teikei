export const countries = {
  DE: {
    center: {
      lat: 51.1657,
      lon: 10.4515,
    },
    zoom: 6,
  },
  CH: {
    center: {
      lat: 46.8182,
      lon: 8.2275,
    },
    zoom: 8,
  },
}


const defaultConfig = () => ({
  country: 'DE',
  padding: [0, 170],
  zoom: {
    default: 8,
    min: 6,
    max: 15,
    searchResult: 14,
  },
  apiKey: process.env.REACT_APP_MAP_API_KEY,
  baseUrl: '/map#',
  apiBaseUrl: '/api/v1',
  assetsBaseUrl: '/assets',
})

const userConfig = Teikei.config || {}

export default Object.freeze(({ ...defaultConfig(), ...userConfig }))
