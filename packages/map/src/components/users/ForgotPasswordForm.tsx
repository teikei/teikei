import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/components/ui/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  ForgotPasswordFormData,
  forgotPasswordSchema
} from '../../common/validation/schemas'
import { SIGN_IN } from '../../routes'

interface ForgotPasswordFormProps {
  onSubmit: (values: ForgotPasswordFormData) => void
  isLoading?: boolean
}

const ForgotPasswordForm = ({
  onSubmit,
  isLoading = false
}: ForgotPasswordFormProps) => {
  const { t } = useTranslation()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  const handleSubmit = (values: ForgotPasswordFormData) => {
    onSubmit(values)
  }

  // Custom error message translation
  const getErrorMessage = (error: any) => {
    if (!error?.message) return ''
    return t(error.message)
  }

  return (
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {t('user.form.forgot_password')}
        </h2>
        <p className='text-sm text-gray-600'>
          {t('user.form.password_explanation')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('user.form.email')}</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder={t('user.form.email')}
                    {...field}
                  />
                </FormControl>
                {fieldState.error && (
                  <p className='text-sm font-medium text-red-600'>
                    {getErrorMessage(fieldState.error)}
                  </p>
                )}
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading
              ? t('user.form.submitting')
              : t('user.form.reset_password')}
          </Button>
        </form>
      </Form>

      <div className='text-center'>
        <p className='text-sm text-gray-600'>
          {t('user.form.remember_password')}
          <Link
            to={SIGN_IN}
            className='text-sm text-primary hover:text-primary/90 font-bold ml-1'
          >
            {t('user.form.sign_in_link')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
