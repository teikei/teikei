import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import {
  type CreateInitiativeParams,
  useCreateInitiative
} from '~/api/create-initiative'
import { getBadgesQuery, useGetBadges } from '~/api/get-badges'
import { getEntriesQueryKey } from '~/api/get-entries'
import { getGoalsQuery, useGetGoals } from '~/api/get-goals'
import {
  getMyEntryQuery,
  getMyEntryQueryKey,
  useGetMyEntry
} from '~/api/get-my-entry'
import {
  type UpdateInitiativeParams,
  useUpdateInitiative
} from '~/api/update-initiative'
import { useUserData } from '~/api/use-user-data'
import { getInitialValues } from '~/features/entries/utils/editor-utils'
import { queryClient } from '~/lib/query-client'
import { MAP } from '~/lib/routes'

export const initiativeClientLoader = async ({
  params
}: {
  params: { id?: string }
}) => {
  const { id } = params
  return Promise.all([
    queryClient.fetchQuery(getGoalsQuery()),
    queryClient.fetchQuery(getBadgesQuery()),
    id !== undefined
      ? queryClient.fetchQuery(getMyEntryQuery({ type: 'initiatives', id }))
      : null
  ])
}

export type InitiativeEditorLoaderData = Awaited<
  ReturnType<typeof initiativeClientLoader>
>

type InferQueryData<T> = T extends { data: infer Data } ? Data : undefined

interface UseInitiativeEditorOptions {
  mode: 'create' | 'update'
}

interface UseInitiativeEditorResult {
  title: string
  handleSubmit: (
    values: CreateInitiativeParams | UpdateInitiativeParams
  ) => void
  initialValues: ReturnType<typeof getInitialValues>
  user: ReturnType<typeof useUserData>
  goals: InferQueryData<ReturnType<typeof useGetGoals>>
  badges: InferQueryData<ReturnType<typeof useGetBadges>>
  isSubmitting: boolean
}

export const useInitiativeEditor = ({
  mode
}: UseInitiativeEditorOptions): UseInitiativeEditorResult => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const initialData = useLoaderData() as InitiativeEditorLoaderData | undefined
  const [
    goalsQueryInitialData,
    badgesQueryInitialData,
    myPlaceQueryInitialData
  ] = initialData || []

  const goalsQuery = useGetGoals({
    initialData: goalsQueryInitialData ?? undefined
  })

  const badgesQuery = useGetBadges({
    initialData: badgesQueryInitialData ?? undefined
  })

  const initiativeQuery = useGetMyEntry(
    { type: 'initiatives', id: id! },
    {
      initialData: myPlaceQueryInitialData
        ? myPlaceQueryInitialData
        : undefined,
      enabled: mode === 'update'
    }
  )

  const createInitiativeMutation = useCreateInitiative({
    onSuccess: (response) => {
      if (response.properties.id === undefined) {
        Alert.error(t('errors.initiative_not_created'))
        return
      }

      Alert.success(
        t('forms.initiative.entry_create_success', {
          name: response.properties.name
        })
      )
      navigate(MAP)
      queryClient.invalidateQueries({ queryKey: getEntriesQueryKey })
    }
  })

  const updateInitiativeMutation = useUpdateInitiative({
    onSuccess: (response, variables) => {
      if (response.properties.id !== variables.id) {
        Alert.error(t('errors.initiative_not_updated'))
        return
      }

      Alert.success(t('places.form.initiative.initiative_create_success'))
      navigate(MAP)
      queryClient.invalidateQueries({ queryKey: getEntriesQueryKey })
      queryClient.invalidateQueries({
        queryKey: getMyEntryQueryKey({ type: 'initiatives', id: id! })
      })
    }
  })

  const handleSubmit = (
    values: CreateInitiativeParams | UpdateInitiativeParams
  ) => {
    if (mode === 'create') {
      createInitiativeMutation.mutate(values as CreateInitiativeParams)
    }

    if (mode === 'update') {
      updateInitiativeMutation.mutate(values as UpdateInitiativeParams)
    }
  }

  const initialValues = getInitialValues(
    initiativeQuery.data,
    'initiative',
    mode
  )

  const user = useUserData()

  return {
    title:
      mode === 'create'
        ? t('places.forms.initiative_create_title')
        : t('places.forms.initiative_edit_title'),
    handleSubmit,
    initialValues,
    user,
    goals: goalsQuery.data,
    badges: badgesQuery.data,
    isSubmitting:
      createInitiativeMutation.isPending || updateInitiativeMutation.isPending
  }
}
