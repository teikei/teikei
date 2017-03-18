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
  center: {
    lat: 51.1657,
    lon: 10.4515,
  },
  defaultBounds: [[47.2703, 5.8667], [54.0585, 15.0419]],
  country: 'DE',
  padding: [0, 170],
  zoom: {
    default: 8,
    min: 6,
    max: 14,
    searchResult: 13,
  },
  apiKey: process.env.REACT_APP_MAP_API_KEY,
  apiBaseUrl: '/api/v1',
  assetsBaseUrl: '/assets',
})

const userConfig = Teikei.config || {}

export default Object.freeze(({ ...defaultConfig(), ...userConfig }))
