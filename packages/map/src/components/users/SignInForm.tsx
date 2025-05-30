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
import { SignInFormData, signInSchema } from '../../common/validation/schemas'
import { RECOVER_PASSWORD, SIGN_UP } from '../../routes'

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

  // Custom error message translation
  const getErrorMessage = (error: any) => {
    if (!error?.message) return ''
    return t(error.message)
  }

  return (
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {t('user.form.sign_in_title')}
        </h2>
        <p className='text-sm text-gray-600'>
          {t('user.form.new')}
          <Link
            to={SIGN_UP}
            className='text-sm text-primary hover:text-primary/90 font-bold'
          >
            {t('user.form.sign_up_link')}
          </Link>
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

          <FormField
            control={form.control}
            name='password'
            render={({ field, fieldState }) => (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel>{t('user.form.password')}</FormLabel>
                  <Link
                    to={RECOVER_PASSWORD}
                    className='text-sm text-primary hover:text-primary/90 font-bold'
                  >
                    {t('user.form.forgot_password')}
                  </Link>
                </div>
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

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? t('user.form.submitting') : t('user.form.submit')}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default SignInForm
