/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
    "./node_modules/react-tailwindcss-select/dist/index.esm.js",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [
    require("flowbite/plugin"),
    require("@headlessui/tailwindcss"),
    require("@tailwindcss/typography"),
  ],
};
