import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { useDeletePlace } from '~/api/delete-place'
import { getPlaceQuery, useGetPlace } from '~/api/get-place'
import { queryClient } from '~/lib/query-client'
import { requireUser } from '~/lib/require-user'
import { MY_ENTRIES } from '~/routes'
import type { PlaceType } from '~/types/types'

type DeletePlaceClientLoaderArgs = {
  request: Request
  params: { id?: string }
}

export const makeDeletePlaceClientLoader =
  <Args extends DeletePlaceClientLoaderArgs>(type: PlaceType) =>
  async (args: Args) => {
    await requireUser(args.request)
    const { id } = args.params
    if (!id) {
      throw new Response('Not Found', { status: 404 })
    }

    return queryClient.fetchQuery(getPlaceQuery({ type, id }))
  }

export function useDeletePlaceRoute(placeType: PlaceType) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const placeQuery = useGetPlace(
    { type: placeType, id: id! },
    { enabled: Boolean(id) }
  )

  const deletePlaceMutation = useDeletePlace({
    onSuccess: (response, variables) => {
      if (response.properties.id !== variables.id) {
        Alert.error(t('errors.delete_failed'))
        return
      }

      Alert.success(t('places.forms.delete.delete_success'))
      navigate(MY_ENTRIES)
    }
  })

  const handleSubmit = () => {
    deletePlaceMutation.mutate({ type: placeType, id: id! })
  }

  return {
    place: placeQuery.data ?? null,
    isLoading: placeQuery.isLoading,
    onSubmit: handleSubmit,
    isSubmitting: deletePlaceMutation.isPending
  }
}
