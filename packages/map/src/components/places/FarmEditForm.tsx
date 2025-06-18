import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { farmSchema, type FarmFormData } from '@/common/validation/schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Geocoder } from '@/components/ui/geocoder'
import { Input } from '@/components/ui/input'
import {
  MultiSelect,
  type MultiSelectOption
} from '@/components/ui/multi-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import {
  createFarm,
  getBadges,
  getProducts,
  updateFarm,
  type CreateFarmParams,
  type UpdateFarmParams
} from '@/queries/places.api'

interface FarmEditFormProps {
  farmId?: string
  initialData?: Partial<FarmFormData>
  onSubmit?: (data: FarmFormData) => void
  onCancel?: () => void
}

export function FarmEditForm({
  farmId,
  initialData,
  onSubmit,
  onCancel
}: FarmEditFormProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Fetch reference data
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  })

  const { data: badgesData } = useQuery({
    queryKey: ['badges'],
    queryFn: getBadges
  })

  // Transform data for multi-select components
  const productOptions: MultiSelectOption[] = React.useMemo(() => {
    return (
      productsData?.data?.map((product: any) => ({
        value: product.id,
        label: product.name
      })) || []
    )
  }, [productsData])

  const badgeOptions: MultiSelectOption[] = React.useMemo(() => {
    return (
      badgesData?.data?.map((badge: any) => ({
        value: badge.id,
        label: badge.name
      })) || []
    )
  }, [badgesData])

  // Form setup
  const form = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: '',
      url: '',
      description: '',
      city: '',
      address: '',
      latitude: 0,
      longitude: 0,
      products: [],
      additionalProductInformation: '',
      actsEcological: false,
      economicalBehavior: '',
      foundedAtYear: undefined,
      foundedAtMonth: undefined,
      badges: [],
      acceptsNewMembers: undefined,
      maximumMembers: undefined,
      participation: '',
      ...initialData
    }
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateFarmParams) => createFarm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['myEntries'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateFarmParams) => updateFarm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['myEntries'] })
      if (farmId) {
        queryClient.invalidateQueries({ queryKey: ['place', 'farms', farmId] })
      }
    }
  })

  // Form submission
  const handleSubmit = async (data: FarmFormData) => {
    setIsSubmitting(true)
    try {
      if (farmId) {
        await updateMutation.mutateAsync({ ...data, id: farmId })
      } else {
        await createMutation.mutateAsync(data)
      }

      if (onSubmit) {
        onSubmit(data)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Address selection handler
  const handleAddressSelect = (addressData: {
    city: string
    address: string
    latitude: number
    longitude: number
  }) => {
    form.setValue('city', addressData.city)
    form.setValue('address', addressData.address)
    form.setValue('latitude', addressData.latitude)
    form.setValue('longitude', addressData.longitude)
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => ({
      value: (1900 + i).toString(),
      label: (1900 + i).toString()
    })
  ).reverse()

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(2000, i).toLocaleDateString('de-DE', { month: 'long' })
  }))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Grundinformationen</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name der Farm *</FormLabel>
                  <FormControl>
                    <Input placeholder='Name eingeben...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder='https://...' type='url' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Beschreiben Sie Ihre Farm...'
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Standort</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse *</FormLabel>
                  <FormControl>
                    <Geocoder
                      control={form.control}
                      name='address'
                      placeholder='Adresse eingeben oder suchen...'
                      onAddressSelect={handleAddressSelect}
                    />
                  </FormControl>
                  <FormDescription>
                    Geben Sie eine Adresse ein oder verwenden Sie Ihren
                    aktuellen Standort
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stadt *</FormLabel>
                  <FormControl>
                    <Input placeholder='Stadt...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='latitude'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breitengrad</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='any'
                        placeholder='0.0'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='longitude'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Längengrad</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='any'
                        placeholder='0.0'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produkte</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='products'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Angebaute Produkte *</FormLabel>
                  <FormControl>
                    <MultiSelect
                      control={form.control}
                      name='products'
                      options={productOptions}
                      placeholder='Produkte auswählen...'
                    />
                  </FormControl>
                  <FormDescription>
                    Wählen Sie alle Produkte aus, die auf Ihrer Farm angebaut
                    werden
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='additionalProductInformation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zusätzliche Produktinformationen</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Weitere Details zu Ihren Produkten...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Economic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Wirtschaftsweise</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='actsEcological'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      Ökologische Wirtschaftsweise
                    </FormLabel>
                    <FormDescription>
                      Wirtschaften Sie nach ökologischen Prinzipien?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='economicalBehavior'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung der Wirtschaftsweise</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Beschreiben Sie Ihre Wirtschaftsweise...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='foundedAtYear'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gründungsjahr</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Jahr wählen' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='foundedAtMonth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gründungsmonat</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Monat wählen' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Membership */}
        <Card>
          <CardHeader>
            <CardTitle>Mitgliedschaft</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='acceptsNewMembers'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neue Mitglieder</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Auswählen...' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='yes'>
                        Ja, wir nehmen neue Mitglieder auf
                      </SelectItem>
                      <SelectItem value='no'>
                        Nein, wir nehmen keine neuen Mitglieder auf
                      </SelectItem>
                      <SelectItem value='waitlist'>Warteliste</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='maximumMembers'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximale Anzahl Mitglieder</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='1'
                      placeholder='z.B. 50'
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='participation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mitarbeit und Partizipation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Beschreiben Sie, wie sich Mitglieder beteiligen können...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Zertifizierungen & Auszeichnungen</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='badges'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Badges</FormLabel>
                  <FormControl>
                    <MultiSelect
                      control={form.control}
                      name='badges'
                      options={badgeOptions}
                      placeholder='Badges auswählen...'
                    />
                  </FormControl>
                  <FormDescription>
                    Wählen Sie relevante Zertifizierungen und Auszeichnungen aus
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className='flex justify-end space-x-4'>
          {onCancel && (
            <Button type='button' variant='outline' onClick={onCancel}>
              Abbrechen
            </Button>
          )}
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            <Save className='mr-2 h-4 w-4' />
            {farmId ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
