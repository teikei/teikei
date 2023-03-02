import { Configuration } from "./types";

const defaultConfig: Configuration = {
  country: "DE",
  countries: {
    DE: {
      center: [51.1657, 10.4515],
      zoom: 6,
    },
    CH: {
      center: [46.8182, 8.2275],
      zoom: 8,
    },
    AT: {
      center: [47.6965, 13.3457],
      zoom: 7,
    },
  },
  padding: [0, 170],
  zoom: {
    default: 8,
    min: 6,
    max: 15,
    searchResult: 14,
  },
  mapToken: import.meta.env.VITE_MAP_TOKEN,
  mapStyle: import.meta.env.VITE_MAP_STYLE,
  mapStaticUrl: import.meta.env.VITE_MAP_STATIC_URL,
  baseUrl: "/#",
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:3030",
  assetsBaseUrl: "/assets",
  externalHelpUrl: "",
};

export default (userConfig: Record<string, any>) =>
  Object.freeze({ ...defaultConfig, ...userConfig });
