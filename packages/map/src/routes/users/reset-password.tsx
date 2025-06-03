import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'
import { ResetPasswordFormData } from '../../common/validation/schemas'
import { Card, CardContent } from '../../components/ui/card'
import ResetPasswordForm from '../../components/users/ResetPasswordForm'
import { resetUserPassword } from '../../queries/users.api'
import { MAP, useQueryString } from '../../routes'

export const Component = () => {
  const { t } = useTranslation()
  const { getQueryString, clearQueryString } = useQueryString()
  const navigate = useNavigate()

  useEffect(() => {
    const queryString = getQueryString()
    // don't allow access without reset_password_token
    if (!queryString.has('reset_password_token')) {
      clearQueryString()
      navigate(MAP)
    }
  }, [getQueryString, clearQueryString, navigate])

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: ResetPasswordFormData) => {
      const queryString = getQueryString()
      const response = await resetUserPassword({
        resetPasswordToken: queryString.get('reset_password_token')!,
        password
      })
      Alert.success(t('forms.user.password_reset_success'))
      // TODO reauth
      // dispatch(authenticateUser())
      navigate(MAP)
      return response
    },
    onError: (error: any) => {
      Alert.closeAll()
      Alert.error(error.message || t('error.reset_password_failed'))
    }
  })

  const handleSubmit = (values: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(values)
  }

  return (
    <div className='grid min-h-screen lg:grid-cols-2 bg-[#f4f7f4]'>
      {/* Left Column - Information (hidden on mobile, visible on lg+) */}
      <div className='hidden lg:flex flex-col justify-start relative overflow-hidden bg-gradient-to-br from-[#e6f4ea] to-[#d0e7d8] p-16 border-r border-[#e0e7e3]'>
        <div className='space-y-10 relative z-10 max-w-xl mx-auto'>
          <div className='space-y-6'>
            <h1 className='text-4xl text-green-900 leading-tight'>
              {t('user.onboarding.title')}
            </h1>
            <p className='text-lg text-green-800/90 leading-relaxed max-w-lg'>
              {t('user.onboarding.reset_password_info')}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className='flex flex-col justify-start px-4 py-10 sm:px-10 md:px-20 lg:px-24 bg-[#f4f7f4] min-h-screen'>
        {/* Mobile header (visible on small screens only) */}
        <div className='lg:hidden mb-8 text-center'>
          <h1 className='text-2xl font-bold text-green-900 mb-2'>
            {t('user.onboarding.title')}
          </h1>
          <p className='text-green-800/90'>
            {t('user.onboarding.reset_password_info')}
          </p>
        </div>

        <div className='mx-auto w-full max-w-lg'>
          <Card className='shadow-lg border border-[#e0e7e3] bg-white/90'>
            <CardContent className='space-y-8 px-8 py-10'>
              <ResetPasswordForm
                onSubmit={handleSubmit}
                isLoading={resetPasswordMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const ErrorBoundary = Component
