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
import { MAP, SIGN_IN } from '~/routes'
import { signUpSchema } from '~/lib/validation/schemas'
import type { SignUpFormData } from '~/lib/validation/schemas'

interface SignUpFormProps {
  onSubmit: (values: SignUpFormData) => void
  signUpSuccess: boolean
  isLoading?: boolean
}

const SignUpForm = ({
  onSubmit,
  signUpSuccess,
  isLoading = false
}: SignUpFormProps) => {
  const { t } = useTranslation()

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    }
  })

  const handleSubmit = (values: SignUpFormData) => {
    onSubmit(values)
  }

  if (signUpSuccess) {
    return (
      <div className='text-center space-y-6'>
        <div className='space-y-2'>
          <h2>{t('users.signup.success_title')}</h2>
          <p>{t('users.signup.success_text')}</p>
        </div>
        <Link
          to={MAP}
          className='inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          {t('users.signup.back_to_map')}
        </Link>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <h2>{t('user.form.sign_up_title')}</h2>
      <div className='max-w-md space-y-8'>
        <p>
          {t('user.form.existing')}{' '}
          <Link to={SIGN_IN}>{t('user.form.sign_in_link')}</Link>
        </p>
        <p className='text-primary/80'>
          mit * markierte Felder werden benötigt
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('user.form.name')} *</FormLabel>
                  <FormControl>
                    <Input type='text' {...field} />
                  </FormControl>
                  <ErrorLabel error={fieldState.error} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('user.form.phone')}</FormLabel>
                  <FormControl>
                    <Input type='text' {...field} />
                  </FormControl>
                  <ErrorLabel error={fieldState.error} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('user.form.email')} *</FormLabel>
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
                  <FormLabel>{t('user.form.password')} *</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} />
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
                  <FormLabel>
                    {t('user.form.password_confirmation')} *
                  </FormLabel>
                  <FormControl>
                    <Input type='password' {...field} />
                  </FormControl>
                  <ErrorLabel error={fieldState.error} />
                </FormItem>
              )}
            />

            <p>
              <span className='block mb-2 text-primary/80'>
                {t('user.form.confirmation')}
              </span>
              <a
                href='https://ernte-teilen.org/nutzungsbedingungen'
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('user.form.terms')}
              </a>
              &nbsp;/&nbsp;
              <a
                href='https://ernte-teilen.org/datenschutz'
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('user.form.privacy')}
              </a>
            </p>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? t('user.form.submitting') : t('user.form.submit')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default SignUpForm
