import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'
import { SignInFormData, SignUpFormData } from '../../common/validation/schemas'
import { Card, CardContent } from '../../components/ui/card'
import SignInForm from '../../components/users/SignInForm'
import SignUpForm from '../../components/users/SignUpForm'
import configuration from '../../configuration'
import { signInUser, signUpUser } from '../../queries/users.api'
import { MAP, useQueryString } from '../../routes'

interface UserOnboardingProps {
  signUp?: boolean
}

const useRedirectionTarget = () => {
  const { getQueryString } = useQueryString()
  const queryString = getQueryString()
  if (queryString.has('redirect')) {
    return {
      targetUrl: queryString.get('redirect') as string,
      isRedirect: true
    }
  }
  return { targetUrl: MAP, isRedirect: false }
}

const UserOnboarding = ({ signUp = false }: UserOnboardingProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { targetUrl, isRedirect } = useRedirectionTarget()

  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const signInMutation = useMutation({
    mutationFn: async (user: SignInFormData) => {
      const response = await signInUser(user)
      if (response.user?.email === user.email) {
        Alert.closeAll()
        Alert.success(
          t('user.onboarding.sign_in_success', {
            username: response.user.name
          })
        )
        navigate(targetUrl)
      } else {
        // Handle API error response
        throw new Error(t('errors.sign_in_failed_long_text'))
      }
      return response
    },
    onError: (error: any) => {
      Alert.closeAll()
      Alert.error(error.message || t('errors.sign_in_failed_long_text'))
    }
  })

  const signUpMutation = useMutation({
    mutationFn: async (values: SignUpFormData) => {
      const { email, name, password, phone } = values
      const response = await signUpUser({
        email,
        name,
        password,
        phone: phone || '',
        // TODO fix casing
        baseurl: configuration.baseUrl,
        locale: configuration.userCommunicationLocale
      })
      if (response.type === 'User') {
        setSignUpSuccess(true)
      } else {
        // Handle API error response
        throw new Error(t('errors.sign_up_failed_long_text'))
      }
      return response
    },
    onError: (error: any) => {
      Alert.closeAll()
      Alert.error(error.message || t('errors.sign_up_failed_long_text'))
    }
  })

  const handleSignInSubmit = (values: SignInFormData) => {
    signInMutation.mutate(values)
  }

  const handleSignUpSubmit = (values: SignUpFormData) => {
    signUpMutation.mutate(values)
  }

  return (
    <div className='grid min-h-screen lg:grid-cols-2'>
      {/* Left Column - Information (hidden on mobile, visible on lg+) */}
      <div className='hidden lg:flex flex-col bg-gradient-to-br from-green-50 to-green-100 p-10 justify-center relative overflow-hidden'>
        {/* Background pattern */}
        <div className='absolute inset-0 opacity-5'>
          <svg
            className='w-full h-full'
            viewBox='0 0 100 100'
            xmlns='http://www.w3.org/2000/svg'
          >
            <defs>
              <pattern
                id='grain'
                patternUnits='userSpaceOnUse'
                width='10'
                height='10'
              >
                <circle cx='5' cy='5' r='1' fill='currentColor' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#grain)' />
          </svg>
        </div>

        <div className='space-y-8 relative z-10'>
          <div className='flex items-center space-x-3'>
            <img
              src='/assets/icon-farm.svg'
              alt='Teikei'
              className='h-12 w-12 drop-shadow-sm'
            />
            <span className='text-3xl font-bold text-green-800 tracking-tight'>
              Teikei
            </span>
          </div>

          <div className='space-y-6'>
            <h1 className='text-4xl font-bold text-gray-900 leading-tight'>
              {t('user.onboarding.title')}
            </h1>
            <p className='text-lg text-gray-700 leading-relaxed max-w-md'>
              {isRedirect
                ? t('user.onboarding.protected_view_info')
                : t('user.onboarding.intro')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 pt-8 max-w-sm'>
            <div className='flex items-center space-x-4 p-4 bg-white/50 rounded-lg backdrop-blur-sm'>
              <img
                src='/assets/icon-farm.svg'
                alt='Betriebe'
                className='h-10 w-10 text-green-600 flex-shrink-0'
              />
              <p className='text-sm font-medium text-gray-700'>
                Betriebe entdecken und vernetzen
              </p>
            </div>
            <div className='flex items-center space-x-4 p-4 bg-white/50 rounded-lg backdrop-blur-sm'>
              <img
                src='/assets/icon-depot.svg'
                alt='Abholstellen'
                className='h-10 w-10 text-green-600 flex-shrink-0'
              />
              <p className='text-sm font-medium text-gray-700'>
                Abholstellen in der Nähe finden
              </p>
            </div>
            <div className='flex items-center space-x-4 p-4 bg-white/50 rounded-lg backdrop-blur-sm'>
              <img
                src='/assets/icon-initiative.svg'
                alt='Initiativen'
                className='h-10 w-10 text-green-600 flex-shrink-0'
              />
              <p className='text-sm font-medium text-gray-700'>
                Initiativen aufbauen und beitreten
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className='flex flex-col justify-center p-6 sm:p-10 lg:p-16'>
        {/* Mobile header (visible on small screens only) */}
        <div className='lg:hidden mb-8 text-center'>
          <div className='flex items-center justify-center space-x-3 mb-4'>
            <img src='/assets/icon-farm.svg' alt='Teikei' className='h-8 w-8' />
            <span className='text-xl font-bold text-green-800'>Teikei</span>
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            {t('user.onboarding.title')}
          </h1>
          <p className='text-gray-600'>
            {isRedirect
              ? t('user.onboarding.protected_view_info')
              : t('user.onboarding.intro')}
          </p>
        </div>

        <Card className='mx-auto w-full max-w-md'>
          <CardContent className='space-y-6'>
            {signUp ? (
              <SignUpForm
                onSubmit={handleSignUpSubmit}
                signUpSuccess={signUpSuccess}
                isLoading={signUpMutation.isPending}
              />
            ) : (
              <SignInForm
                onSubmit={handleSignInSubmit}
                isLoading={signInMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserOnboarding
