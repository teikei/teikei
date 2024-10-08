import { Link } from 'react-router-dom'
import EntriesNav from '../../components/EntriesNavigation'
import AccountNav from '../../components/AccountNavigation'
import { config } from '../../main'
import { history, MAP, SIGN_IN } from '../../AppRouter'
import i18n from '../../i18n'
import { useGlobalState } from '../../StateContext'
import { useMutation } from '@tanstack/react-query'
import { signOutUser } from '../../api/user'
import Alert from 'react-s-alert'

interface MemberNavProps {
  username: string
  onSignOutClick: () => void
}

const MemberNav = ({
  username,
  onSignOutClick
}: MemberNavProps): JSX.Element => (
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

const GuestNav = (): JSX.Element => (
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

const HelpInternal = (): JSX.Element => (
  <Link className='button button-help' to='info'>
    {i18n.t('nav.help')}
  </Link>
)

const HelpExternal = (): JSX.Element => (
  <a
    className='button button-help'
    href={config.externalHelpUrl}
    target='_blank'
    rel='noopener noreferrer'
  >
    {i18n.t('nav.help')}
  </a>
)

const Navigation = (): JSX.Element => {
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
