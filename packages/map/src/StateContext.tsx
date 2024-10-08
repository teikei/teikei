import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { config } from './main.tsx'
import { User } from './types/types.ts'

type GlobalState = {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  country: string
  setCountry: (country: string) => void
  authenticationCompleted: boolean
}

export const GlobalStateContext = createContext<GlobalState | null>(null)

export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [authenticationCompleted, setAuthenticationCompleted] = useState(false)

  const [country, setCountry] = useState(config.country)

  // TODO this function and  authenticationCompleted can probably be removed when using a react-router loader
  const setCurrentUserAndCompleteAuthentication = (user: User | null) => {
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
