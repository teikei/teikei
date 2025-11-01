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
import { signInSchema } from '~/lib/validation/schemas'
import type { SignInFormData } from '~/lib/validation/schemas'
import { RECOVER_PASSWORD, SIGN_UP } from '~/routes'

interface SignInFormProps {
  onSubmit: (values: SignInFormData) => void
  isLoading?: boolean
}

const SignInForm = ({ onSubmit, isLoading = false }: SignInFormProps) => {
  const { t } = useTranslation()

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const handleSubmit = (values: SignInFormData) => {
    onSubmit(values)
  }

  return (
    <div className='space-y-8'>
      <h2>{t('user.form.sign_in_title')}</h2>
      <div className='max-w-md space-y-8'>
        <p>
          {t('user.form.new')}
          <Link to={SIGN_UP}>{t('user.form.sign_up_link')}</Link>
        </p>
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

            <FormField
              control={form.control}
              name='password'
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>{t('user.form.password')}</FormLabel>
                    <Link to={RECOVER_PASSWORD}>
                      {t('user.form.forgot_password')}
                    </Link>
                  </div>
                  <FormControl>
                    <Input type='password' {...field} />
                  </FormControl>
                  <ErrorLabel error={fieldState.error} />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? t('user.form.submitting') : t('user.form.submit')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default SignInForm
