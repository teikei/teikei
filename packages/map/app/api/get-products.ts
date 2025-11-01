import {
  type UseQueryOptions,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import { getClient } from '~/lib/clients'

export const getProductsQueryKey = ['getProducts'] as const

async function getProducts() {
  return getClient().service('products').find()
}

export const getProductsQuery = () =>
  queryOptions({
    queryKey: getProductsQueryKey,
    queryFn: getProducts
  })

type GetProductsData = Awaited<ReturnType<typeof getProducts>>
type GetProductsQueryKey = typeof getProductsQueryKey

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
