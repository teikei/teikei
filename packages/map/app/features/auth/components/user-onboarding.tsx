import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'
import { useSignInUser } from '~/api/sign-in-user'
import { useSignUpUser } from '~/api/sign-up-user'
import configuration from '~/config/app-configuration'
import SignInForm from '~/features/auth/components/sign-in-form'
import SignUpForm from '~/features/auth/components/sign-up-form'
import { useQueryString } from '~/hooks/use-query-string'
import type { SignInFormData, SignUpFormData } from '~/lib/validation/schemas'
import { MAP } from '~/routes'

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

  const signInMutation = useSignInUser({
    onSuccess: (response, variables) => {
      if (response.user?.email !== variables.email) {
        Alert.closeAll()
        Alert.error(t('errors.sign_in_failed_long_text'))
        return
      }

      Alert.closeAll()
      Alert.success(
        t('user.onboarding.sign_in_success', {
          username: response.user.name
        })
      )
      navigate(targetUrl)
    },
    onError: (error: any) => {
      Alert.closeAll()
      Alert.error(error.message || t('errors.sign_in_failed_long_text'))
    }
  })

  const signUpMutation = useSignUpUser({
    onSuccess: (response) => {
      if (response.type !== 'User') {
        Alert.closeAll()
        Alert.error(t('errors.sign_up_failed_long_text'))
        return
      }

      setSignUpSuccess(true)
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
    signUpMutation.mutate({
      email: values.email,
      name: values.name,
      password: values.password,
      phone: values.phone || '',
      baseurl: configuration.baseUrl,
      locale: configuration.userCommunicationLocale
    })
  }

  return (
    <div className='grid min-h-screen lg:grid-cols-2 '>
      {/* Left Column - Information (hidden on mobile, visible on lg+) */}
      <div className='hidden lg:flex flex-col justify-start relative ite overflow-hidden p-16 '>
        <div className='space-y-10 relative z-10 max-w-xl mx-auto'>
          <div className='space-y-8'>
            <h2>{t('user.onboarding.title')}</h2>
            <p>
              {isRedirect
                ? t('user.onboarding.protected_view_info')
                : t('user.onboarding.intro')}
            </p>
          </div>
        </div>
      </div>
      {/* Right Column - Form */}
      <div className='flex flex-col justify-start  items-center relative overflow-hidden p-16 bg-[#eaf1ef]'>
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
      </div>
    </div>
  )
}

export default UserOnboarding
