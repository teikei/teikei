import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { config } from './main.tsx'

export const GlobalStateContext = createContext({
  currentUser: null
})
export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState(null)

  const { country: initialCountry } = config

  const [country, setCountry] = useState(initialCountry)

  return (
    <GlobalStateContext.Provider
      value={{
        currentUser,
        setCurrentUser,
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
