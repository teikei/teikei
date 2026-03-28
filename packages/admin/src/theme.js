import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#804d34'
    },
    secondary: {
      main: '#266050'
    }
  },
  components: {
    RaPasswordInput: {
      defaultProps: {
        size: 'medium'
      }
    }
  }
})

export default theme
