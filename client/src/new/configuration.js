const defaultConfig = () => ({
  center: {
    lat: 51.1657,
    lon: 10.4515,
  },
  defaultBounds: [[47.2703, 5.8667], [54.0585, 15.0419]],
  country: 'DE',
  zoom: {
    default: 10,
    min: 6,
    max: 14,
    searchResult: 13,
  },
  apiKey: process.env.REACT_APP_MAP_API_KEY,
  apiBaseUrl: '/api/v1/',
})

const initializeConfig = userConfig => Object.freeze(({ ...defaultConfig(), ...userConfig }))

export default initializeConfig
