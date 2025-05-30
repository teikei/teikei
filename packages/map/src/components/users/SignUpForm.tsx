import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { SignUpFormData, signUpSchema } from '../../common/validation/schemas'
import { MAP, SIGN_IN } from '../../routes'

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

  // Custom error message translation
  const getErrorMessage = (error: any) => {
    if (!error?.message) return ''
    return t(error.message)
  }

  if (signUpSuccess) {
    return (
      <div className='text-center space-y-6'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold text-green-600'>
            {t('users.signup.success_title')}
          </h2>
          <p className='text-gray-700'>{t('users.signup.success_text')}</p>
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
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {t('user.form.sign_up_title')}
        </h2>
        <p className='text-sm text-gray-600'>
          {t('user.form.existing')}{' '}
          <Link
            to={SIGN_IN}
            className='text-blue-600 hover:text-blue-500 underline'
          >
            {t('user.form.sign_in_link')}
          </Link>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('user.form.name')}</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder={t('user.form.name')}
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

          <FormField
            control={form.control}
            name='phone'
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('user.form.phone')}</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder={t('user.form.phone')}
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

          <FormField
            control={form.control}
            name='password'
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('user.form.password')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('user.form.password')}
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

          <FormField
            control={form.control}
            name='passwordConfirmation'
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('user.form.password_confirmation')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('user.form.password_confirmation')}
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

          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              {t('user.form.confirmation')}{' '}
              <a
                href='https://ernte-teilen.org/nutzungsbedingungen'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:text-blue-500 underline'
              >
                {t('user.form.terms')}
              </a>
              /
              <a
                href='https://ernte-teilen.org/datenschutz'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:text-blue-500 underline'
              >
                {t('user.form.privacy')}
              </a>
            </p>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? t('user.form.submitting') : t('user.form.submit')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default SignUpForm
