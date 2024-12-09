const defaultConfig = {
  country: 'DE',
  countries: {
    DE: {
      center: [51.1657, 10.4515],
      zoom: 6
    },
    CH: {
      center: [46.8182, 8.2275],
      zoom: 8
    },
    AT: {
      center: [47.6965, 13.3457],
      zoom: 7
    }
  },
  padding: [0, 170],
  zoom: {
    default: 8,
    min: 6,
    max: 15,
    searchResult: 14
  },
  mapToken: import.meta.env.VITE_MAP_TOKEN,
  mapStyle: import.meta.env.VITE_MAP_STYLE,
  mapStaticUrl: import.meta.env.VITE_MAP_STATIC_URL,
  baseUrl: '/#',
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3030',
  assetsBaseUrl: '/assets',
  externalHelpUrl: '',
  displayLocale: 'de-DE',
  userCommunicationLocale: 'de-DE'
}

type Configuration = typeof defaultConfig

export const appContainerEl = document.getElementById('teikei-app')
export const searchContainerEl = document.getElementById('teikei-search')

const userConfig = {
  ...(appContainerEl ? appContainerEl.dataset : {}),
  ...(searchContainerEl ? searchContainerEl.dataset : {})
}

const mergedConfiguration = {
  ...defaultConfig,
  ...userConfig
} as Configuration

if (mergedConfiguration.country === 'CH-de') {
  mergedConfiguration.country = 'CH'
  mergedConfiguration.countries = {
    ...mergedConfiguration.countries,
    CH: {
      center: [46.8182, 8.2275],
      zoom: 8
    }
  }
}

if (mergedConfiguration.country === 'CH-fr') {
  mergedConfiguration.country = 'CH'
  mergedConfiguration.countries = {
    ...mergedConfiguration.countries,
    CH: {
      center: [46.7407, 7.4114],
      zoom: 10
    }
  }
}

export default Object.freeze(mergedConfiguration) as Configuration
