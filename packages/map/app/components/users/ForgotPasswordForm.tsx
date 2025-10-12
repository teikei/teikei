import { SIGN_IN } from '~/lib/routes'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/ui/button'
import { ErrorLabel } from '~/components/ui/error-label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Link } from '~/components/ui/link'

import { forgotPasswordSchema } from '../../common/validation/schemas'
import type { ForgotPasswordFormData } from '../../common/validation/schemas'

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

  return (
    <div className='space-y-8'>
      <h2>{t('user.form.forgot_password')}</h2>
      <div className='max-w-md space-y-8'>
        <p>{t('user.form.password_explanation')}</p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('user.form.email')}</FormLabel>
                  <FormControl>
                    <Input type='email' {...field} />
                  </FormControl>
                  <ErrorLabel error={fieldState.error} />
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

        <p>
          {t('user.form.remember_password')}{' '}
          <Link to={SIGN_IN}>{t('user.form.sign_in_link')}</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
