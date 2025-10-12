import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState
} from 'react'
import config from '~/configuration'

type GlobalState = {
  country: string
  setCountry: (country: string) => void
}

export const GlobalStateContext = createContext<GlobalState | null>(null)

export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const [country, setCountry] = useState(config.country)

  return (
    <GlobalStateContext.Provider
      value={{
        country,
        setCountry
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  )
}

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext)
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider')
  }
  return context
}
