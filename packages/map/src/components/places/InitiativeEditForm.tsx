import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  initiativeSchema,
  type InitiativeFormData
} from '@/common/validation/schemas'
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
  createInitiative,
  getBadges,
  getGoals,
  updateInitiative,
  type CreateInitiativeParams,
  type UpdateInitiativeParams
} from '@/queries/places.api'

interface InitiativeEditFormProps {
  initiativeId?: string
  initialData?: Partial<InitiativeFormData>
  onSubmit?: (data: InitiativeFormData) => void
  onCancel?: () => void
}

export function InitiativeEditForm({
  initiativeId,
  initialData,
  onSubmit,
  onCancel
}: InitiativeEditFormProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Fetch reference data
  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: getGoals
  })

  const { data: badgesData } = useQuery({
    queryKey: ['badges'],
    queryFn: getBadges
  })

  // Transform data for multi-select components
  const goalOptions: MultiSelectOption[] = React.useMemo(() => {
    return (
      goalsData?.data?.map((goal: any) => ({
        value: goal.id,
        label: goal.name
      })) || []
    )
  }, [goalsData])

  const badgeOptions: MultiSelectOption[] = React.useMemo(() => {
    return (
      badgesData?.data?.map((badge: any) => ({
        value: badge.id,
        label: badge.name
      })) || []
    )
  }, [badgesData])

  // Form setup
  const form = useForm<InitiativeFormData>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      name: '',
      url: '',
      description: '',
      city: '',
      address: '',
      latitude: 0,
      longitude: 0,
      goals: [],
      badges: [],
      ...initialData
    }
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateInitiativeParams) => createInitiative(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['myEntries'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateInitiativeParams) => updateInitiative(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['myEntries'] })
      if (initiativeId) {
        queryClient.invalidateQueries({
          queryKey: ['place', 'initiatives', initiativeId]
        })
      }
    }
  })

  // Form submission
  const handleSubmit = async (data: InitiativeFormData) => {
    setIsSubmitting(true)
    try {
      if (initiativeId) {
        await updateMutation.mutateAsync({ ...data, id: initiativeId })
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
                  <FormLabel>Name der Initiative *</FormLabel>
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
                      placeholder='Beschreiben Sie Ihre Initiative...'
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

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Ziele und Schwerpunkte</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='goals'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ziele der Initiative *</FormLabel>
                  <FormControl>
                    <MultiSelect
                      control={form.control}
                      name='goals'
                      options={goalOptions}
                      placeholder='Ziele auswählen...'
                    />
                  </FormControl>
                  <FormDescription>
                    Wählen Sie die Hauptziele und Schwerpunkte Ihrer Initiative
                    aus
                  </FormDescription>
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
            {initiativeId ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
