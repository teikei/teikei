import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'
import { ForgotPasswordFormData } from '@/common/validation/schemas'
import ForgotPasswordForm from '@/components/users/ForgotPasswordForm'
import { recoverUserPassword } from '@/queries/users.api'
import { MAP } from '@/routes'

export const Component = () => {
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
    <div className='grid min-h-screen lg:grid-cols-2 '>
      {/* Left Column - Information (hidden on mobile, visible on lg+) */}
      <div className='hidden lg:flex flex-col justify-start relative ite overflow-hidden p-16 '>
        <div className='space-y-10 relative z-10 max-w-xl mx-auto'>
          <div className='space-y-8'>
            <h2>{t('user.onboarding.title')}</h2>
            <p>{t('user.onboarding.forgot_password_info')}</p>
          </div>
        </div>
      </div>
      {/* Right Column - Form */}
      <div className='flex flex-col justify-start  items-center relative overflow-hidden p-16 bg-[#eaf1ef]'>
        <ForgotPasswordForm
          onSubmit={handleSubmit}
          isLoading={recoverPasswordMutation.isPending}
        />
      </div>
    </div>
  )
}

export const ErrorBoundary = Component
