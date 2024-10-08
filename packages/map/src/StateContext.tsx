import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { config } from './main.tsx'

export const GlobalStateContext = createContext({
  currentUser: null
})

export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState(null)

  const [authenticationCompleted, setAuthenticationCompleted] = useState(false)

  const { country: initialCountry } = config

  const [country, setCountry] = useState(initialCountry)

  // TODO this function and  authenticationCompleted can probably be removed when using a react-router loader
  const setCurrentUserAndCompleteAuthentication = (user) => {
    setCurrentUser(user)
    setAuthenticationCompleted(true)
  }

  return (
    <GlobalStateContext.Provider
      value={{
        currentUser,
        setCurrentUser: setCurrentUserAndCompleteAuthentication,
        country,
        setCountry,
        authenticationCompleted
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
