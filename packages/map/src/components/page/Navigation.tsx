import { useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { useNavigate, useRouteLoaderData } from 'react-router'

import { MAP, SIGN_IN } from '../../routes'
import { signOutUser } from '../../queries/users.api'
import { RootLoaderData } from '../../root'
import { Link } from 'react-router-dom'
import i18n from '../../i18n.ts'
import config from '../../configuration.ts'
import EntriesNavigation from './EntriesNavigation'
import AccountNavigation from './AccountNavigation'

const HelpInternal = () => (
  <Link className='button button-help' to='info'>
    {i18n.t('nav.help')}
  </Link>
)

const HelpExternal = () => (
  <a
    className='button button-help'
    href={config.externalHelpUrl}
    target='_blank'
    rel='noopener noreferrer'
  >
    {i18n.t('nav.help')}
  </a>
)

interface LoggedInNavigationProps {
  username: string
  onSignOutClick: () => void
}

const LoggedInNavigation = ({
  username,
  onSignOutClick
}: LoggedInNavigationProps) => (
  <div className='user-nav'>
    <ul>
      <li>
        <EntriesNavigation />
      </li>
      <li>
        <AccountNavigation
          username={username}
          onSignOutClick={onSignOutClick}
        />
      </li>
      <li>{config.externalHelpUrl ? <HelpExternal /> : <HelpInternal />}</li>
    </ul>
  </div>
)

const LoggedOutNavigation = () => (
  <div className='user-nav'>
    <ul>
      <li>
        <Link className='account-nav-login' to={SIGN_IN}>
          {i18n.t('nav.edit_entries')}
        </Link>
      </li>
      <li>{config.externalHelpUrl ? <HelpExternal /> : <HelpInternal />}</li>
    </ul>
  </div>
)

const Navigation = () => {
  const navigate = useNavigate()
  const { user } = useRouteLoaderData('root') as RootLoaderData

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const response = await signOutUser()
      Alert.success('Du wurdest erfolgreich abgemeldet.')
      navigate(MAP)
      return response
    },
    meta: {
      errorMessage: 'Du konntest nicht abgemeldet werden.'
    }
  })

  const handleSignOutClick = () => {
    signOutMutation.mutate()
  }

  return (
    <nav>
      {user ? (
        <LoggedInNavigation
          username={user.name}
          onSignOutClick={handleSignOutClick}
        />
      ) : (
        <LoggedOutNavigation />
      )}
    </nav>
  )
}

export default Navigation
