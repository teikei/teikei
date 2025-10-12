
import { MAP } from '~/lib/routes'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'

import type { ForgotPasswordFormData } from '~/common/validation/schemas'
import { Card, CardContent } from '~/components/ui/card'
import ForgotPasswordForm from '~/components/users/ForgotPasswordForm'
import { recoverUserPassword } from '~/queries/users.api'

export default function ForgotPasswordRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const recoverPasswordMutation = useMutation({
    mutationFn: async (values: ForgotPasswordFormData) => {
      const response = await recoverUserPassword(values)
      Alert.success(t('forms.user.recover_password_success'))
      navigate(MAP)
      return response
    },
    onError: (error: any) => {
      Alert.closeAll()
      Alert.error(error.message || t('errors.recover_password_failed'))
    }
  })

  const handleSubmit = (values: ForgotPasswordFormData) => {
    recoverPasswordMutation.mutate(values)
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
              {t('user.onboarding.forgot_password_info')}
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
            {t('user.onboarding.forgot_password_info')}
          </p>
        </div>

        <div className='mx-auto w-full max-w-lg'>
          <Card className='shadow-lg border border-[#e0e7e3] bg-white/90'>
            <CardContent className='space-y-8 px-8 py-10'>
              <ForgotPasswordForm
                onSubmit={handleSubmit}
                isLoading={recoverPasswordMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  return <div>Unable to load forgot password page.</div>
}