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
    <div className='grid min-h-screen lg:grid-cols-2 bg-[#f4f7f4]'>
      {/* Left Column - Information (hidden on mobile, visible on lg+) */}
      <div className='hidden lg:flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-[#e6f4ea] to-[#d0e7d8] p-16 border-r border-[#e0e7e3]'>
        <div className='space-y-10 relative z-10 max-w-xl mx-auto'>
          <div className='space-y-6'>
            <h1 className='text-4xl font-extrabold text-green-900 leading-tight'>
              {t('user.onboarding.title')}
            </h1>
            <p className='text-lg text-green-800/90 leading-relaxed max-w-lg'>
              {isRedirect
                ? t('user.onboarding.protected_view_info')
                : t('user.onboarding.intro')}
            </p>
          </div>
        </div>
      </div>
      {/* Right Column - Form */}
      <div className='flex flex-col justify-center px-4 py-10 sm:px-10 md:px-20 lg:px-24 bg-[#f4f7f4] min-h-screen'>
        {/* Mobile header (visible on small screens only) */}
        <div className='lg:hidden mb-8 text-center'>
          <div className='flex items-center justify-center gap-3 mb-4'>
            <img src='/assets/icon-farm.svg' alt='Teikei' className='h-8 w-8' />
            <span className='text-2xl font-extrabold text-green-900'>
              Teikei
            </span>
          </div>
          <h1 className='text-2xl font-bold text-green-900 mb-2'>
            {t('user.onboarding.title')}
          </h1>
          <p className='text-green-800/90'>
            {isRedirect
              ? t('user.onboarding.protected_view_info')
              : t('user.onboarding.intro')}
          </p>
        </div>
        <div className='mx-auto w-full max-w-lg'>
          <Card className='shadow-lg border border-[#e0e7e3] bg-white/90'>
            <CardContent className='space-y-8 px-8 py-10'>
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
    </div>
  )
}

export default UserOnboarding
