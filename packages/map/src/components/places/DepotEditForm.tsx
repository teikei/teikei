import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { depotSchema, type DepotFormData } from '@/common/validation/schemas'
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
import { Textarea } from '@/components/ui/textarea'

import {
  createDepot,
  getFarms,
  updateDepot,
  type CreateDepotParams,
  type UpdateDepotParams
} from '@/queries/places.api'

interface DepotEditFormProps {
  depotId?: string
  initialData?: Partial<DepotFormData>
  onSubmit?: (data: DepotFormData) => void
  onCancel?: () => void
}

export function DepotEditForm({
  depotId,
  initialData,
  onSubmit,
  onCancel
}: DepotEditFormProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Fetch reference data
  const { data: farmsData } = useQuery({
    queryKey: ['farms'],
    queryFn: getFarms
  })

  // Transform data for multi-select components
  const farmOptions: MultiSelectOption[] = React.useMemo(() => {
    return (
      farmsData?.data?.map((farm: any) => ({
        value: farm.id,
        label: farm.name
      })) || []
    )
  }, [farmsData])

  // Form setup
  const form = useForm<DepotFormData>({
    resolver: zodResolver(depotSchema),
    defaultValues: {
      name: '',
      url: '',
      description: '',
      city: '',
      address: '',
      latitude: 0,
      longitude: 0,
      farms: [],
      deliveryDays: '',
      ...initialData
    }
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateDepotParams) => createDepot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['myEntries'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDepotParams) => updateDepot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['myEntries'] })
      if (depotId) {
        queryClient.invalidateQueries({
          queryKey: ['place', 'depots', depotId]
        })
      }
    }
  })

  // Form submission
  const handleSubmit = async (data: DepotFormData) => {
    setIsSubmitting(true)
    try {
      if (depotId) {
        await updateMutation.mutateAsync({ ...data, id: depotId })
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
                  <FormLabel>Name des Depots *</FormLabel>
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
                      placeholder='Beschreiben Sie Ihr Depot...'
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

        {/* Farm Association */}
        <Card>
          <CardHeader>
            <CardTitle>Zugeordnete Höfe</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='farms'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verbundene Höfe *</FormLabel>
                  <FormControl>
                    <MultiSelect
                      control={form.control}
                      name='farms'
                      options={farmOptions}
                      placeholder='Höfe auswählen...'
                    />
                  </FormControl>
                  <FormDescription>
                    Wählen Sie die Höfe aus, die dieses Depot beliefern
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle>Lieferinformationen</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='deliveryDays'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liefertage</FormLabel>
                  <FormControl>
                    <Input placeholder='z.B. Dienstag und Freitag' {...field} />
                  </FormControl>
                  <FormDescription>
                    Geben Sie die Wochentage an, an denen das Depot beliefert
                    wird
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
            {depotId ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
