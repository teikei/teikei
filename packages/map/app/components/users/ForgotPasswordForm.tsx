import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ErrorLabel } from '~/components/ds/form/error-label'
import { Link } from '~/components/ds/link'
import { Button } from '~/components/ds/shadcn/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '~/components/ds/shadcn/form'
import { Input } from '~/components/ds/shadcn/input'
import { SIGN_IN } from '~/lib/routes'

import { forgotPasswordSchema } from '../../lib/validation/schemas'
import type { ForgotPasswordFormData } from '../../lib/validation/schemas'

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
