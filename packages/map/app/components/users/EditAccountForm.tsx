import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ErrorLabel } from '~/components/ds/form/error-label'
import { Button } from '~/components/ds/shadcn/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '~/components/ds/shadcn/form'
import { Input } from '~/components/ds/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ds/shadcn/select'

import { editAccountSchema } from '../../lib/validation/schemas'
import type { EditAccountFormData } from '../../lib/validation/schemas'

interface EditAccountFormProps {
  initialValues: {
    id: string
    name: string
    email: string
    phone?: string
    locale?: string
  }
  onSubmit: (values: EditAccountFormData & { id: string }) => void
  isLoading?: boolean
}

const EditAccountForm = ({
  initialValues,
  onSubmit,
  isLoading = false
}: EditAccountFormProps) => {
  const { t } = useTranslation()

  const form = useForm<EditAccountFormData>({
    resolver: zodResolver(editAccountSchema),
    defaultValues: {
      name: initialValues.name || '',
      email: initialValues.email || '',
      phone: initialValues.phone || '',
      locale: (initialValues.locale as 'de-DE' | 'de-CH' | 'fr-CH') || 'de-DE',
      password: ''
    }
  })

  const handleSubmit = (values: EditAccountFormData) => {
    onSubmit({ ...values, id: initialValues.id })
  }

  return (
    <div className='grid min-h-screen bg-[#f4f7f4]'>
      <div className='flex flex-col justify-start px-4 py-10 sm:px-10 md:px-20 lg:px-24 bg-[#f4f7f4] min-h-screen'>
        <div className='mx-auto w-full max-w-2xl'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-green-900 mb-2'>
              {t('users.account.edit_account_data')}
            </h1>
          </div>

          <div className='bg-white/90 shadow-lg border border-[#e0e7e3] rounded-lg p-8'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className='space-y-8'
              >
                {/* User Data Section */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2'>
                    {t('users.account.your_user_data')}
                  </h3>

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
                            maxLength={100}
                            {...field}
                          />
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
                        <FormLabel>{t('user.form.email')}</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder={t('user.form.email')}
                            maxLength={100}
                            {...field}
                          />
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
                          <Input
                            type='text'
                            placeholder={t('user.form.phone')}
                            maxLength={100}
                            {...field}
                          />
                        </FormControl>
                        <ErrorLabel error={fieldState.error} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='locale'
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>{t('forms.useraccount.locale')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('forms.useraccount.locale')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='de-DE'>
                              {t('forms.useraccount.locale.deDE')}
                            </SelectItem>
                            <SelectItem value='de-CH'>
                              {t('forms.useraccount.locale.deCH')}
                            </SelectItem>
                            <SelectItem value='fr-CH'>
                              {t('forms.useraccount.locale.frCH')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <ErrorLabel error={fieldState.error} />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password Section */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2'>
                    {t('users.account.password')}
                  </h3>

                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          {t('users.account.current_password_label')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder={t(
                              'users.account.current_password_label'
                            )}
                            maxLength={100}
                            {...field}
                          />
                        </FormControl>
                        <p className='text-sm text-gray-600'>
                          {t('users.account.current_password')}
                        </p>
                        <ErrorLabel error={fieldState.error} />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading
                    ? t('user.form.submitting')
                    : t('users.account.submit')}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditAccountForm
