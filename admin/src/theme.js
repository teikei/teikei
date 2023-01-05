import { createTheme } from '@material-ui/core/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#804d34',
    },
    secondary: {
      main: '#266050',
    },
    overrides: {
      '.RaLogin-main-77': {
        background: 'red',
      },
    },
  },
})

export default theme
