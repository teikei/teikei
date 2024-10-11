import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'

import EntriesNav from '../page/EntriesNavigation'
import AccountNav from '../page/AccountNavigation'
import config from '../../configuration'
import { history, MAP, SIGN_IN } from '../../routes'
import i18n from '../../i18n'
import { useGlobalState } from '../../StateContext'
import { signOutUser } from '../../queries/users.api.ts'

interface MemberNavProps {
  username: string
  onSignOutClick: () => void
}

const MemberNav = ({ username, onSignOutClick }: MemberNavProps) => (
  <div className='user-nav'>
    <ul>
      <li>
        <EntriesNav />
      </li>
      <li>
        <AccountNav username={username} onSignOutClick={onSignOutClick} />
      </li>
      <li>{config.externalHelpUrl ? <HelpExternal /> : <HelpInternal />}</li>
    </ul>
  </div>
)

const GuestNav = () => (
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

const Navigation = () => {
  const { currentUser, setCurrentUser } = useGlobalState()

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const response = await signOutUser()
      Alert.success('Du wurdest erfolgreich abgemeldet.')
      history.push(MAP)
      setCurrentUser(null)
      return response
    },
    onError: () => {
      Alert.error(
        'Du konntest nicht abgemeldet werden. Bitte versuche es erneut.'
      )
    }
  })

  const handleSignOutClick = () => {
    signOutMutation.mutate()
  }

  return (
    <nav>
      {currentUser ? (
        <MemberNav
          username={currentUser ? currentUser.name : ''}
          onSignOutClick={handleSignOutClick}
        />
      ) : (
        <GuestNav />
      )}
    </nav>
  )
}

export default Navigation
