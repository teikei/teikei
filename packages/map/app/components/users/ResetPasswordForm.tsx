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

import { resetPasswordSchema } from '../../common/validation/schemas'
import type { ResetPasswordFormData } from '../../common/validation/schemas'

interface ResetPasswordFormProps {
  onSubmit: (values: ResetPasswordFormData) => void
  isLoading?: boolean
}

const ResetPasswordForm = ({
  onSubmit,
  isLoading = false
}: ResetPasswordFormProps) => {
  const { t } = useTranslation()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      passwordConfirmation: ''
    }
  })

  const handleSubmit = (values: ResetPasswordFormData) => {
    onSubmit(values)
  }

  return (
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {t('users.forms.reset_password_title')}
        </h2>
        <p className='text-sm text-gray-600'>
          {t('users.forms.reset_password_description')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='password'
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('users.forms.new_password')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('users.forms.new_password')}
                    {...field}
                  />
                </FormControl>
                <ErrorLabel error={fieldState.error} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='passwordConfirmation'
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('users.forms.confirm_password')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('users.forms.confirm_password')}
                    {...field}
                  />
                </FormControl>
                <ErrorLabel error={fieldState.error} />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? t('user.form.submitting') : t('users.forms.submit')}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default ResetPasswordForm
