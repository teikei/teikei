import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

export interface GetAutocompleteSuggestionsParams {
  text: string
  withEntries?: boolean
  locale?: string
}

export interface GetAutocompleteSuggestionsQueryParams {
  text?: string
  withEntries?: boolean
  locale?: string
}

const DEFAULT_LOCALE = 'de-DE'
const DEFAULT_WITH_ENTRIES = true

const getAutocompleteSuggestionsQueryKey = (
  params: GetAutocompleteSuggestionsQueryParams
) =>
  [
    'autocomplete',
    params.text ?? '',
    params.locale ?? DEFAULT_LOCALE,
    params.withEntries ?? DEFAULT_WITH_ENTRIES
  ] as const

export async function getAutocompleteSuggestions(
  params: GetAutocompleteSuggestionsParams
) {
  const { text, withEntries, locale } = params
  return getClient()
    .service('autocomplete')
    .create({ text, locale }, withEntries ? { query: { entries: true } } : {})
}

export const getAutocompleteSuggestionsQuery = (
  params: GetAutocompleteSuggestionsQueryParams
) =>
  queryOptions({
    queryKey: getAutocompleteSuggestionsQueryKey(params),
    queryFn: () => {
      if (!params.text) {
        return []
      }

      return getAutocompleteSuggestions({
        text: params.text,
        withEntries: params.withEntries,
        locale: params.locale
      })
    }
  })

type GetAutocompleteSuggestionsData = Awaited<
  ReturnType<typeof getAutocompleteSuggestions>
>
type GetAutocompleteSuggestionsQueryKey = ReturnType<
  typeof getAutocompleteSuggestionsQueryKey
>

type UseGetAutocompleteSuggestionsOptions = Omit<
  UseQueryOptions<
    GetAutocompleteSuggestionsData,
    Error,
    GetAutocompleteSuggestionsData,
    GetAutocompleteSuggestionsQueryKey
  >,
  'queryKey' | 'queryFn'
>

export function useGetAutocompleteSuggestions(
  params: GetAutocompleteSuggestionsQueryParams,
  options?: UseGetAutocompleteSuggestionsOptions
) {
  const defaultEnabled = Boolean(params.text && params.text.length > 1)

  return useQuery({
    ...getAutocompleteSuggestionsQuery(params),
    enabled: options?.enabled ?? defaultEnabled,
    ...options
  })
}
