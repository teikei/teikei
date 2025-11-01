import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

const queryKey = ['getProducts'] as const

export async function getProducts() {
  return getClient().service('products').find()
}

export const getProductsQuery = () =>
  queryOptions({
    queryKey,
    queryFn: getProducts
  })

type GetProductsData = Awaited<ReturnType<typeof getProducts>>
type GetProductsQueryKey = typeof queryKey

type UseGetProductsOptions = Omit<
  UseQueryOptions<GetProductsData, Error, GetProductsData, GetProductsQueryKey>,
  'queryKey' | 'queryFn'
>

export function useGetProducts(options?: UseGetProductsOptions) {
  return useQuery({
    ...getProductsQuery(),
    ...options
  })
}
