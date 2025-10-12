import type { DefaultError } from '@tanstack/query-core'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { getErrorMessage } from '~/common/editorUtils'
import type { ErrorResponse } from '~/types/types'

const handleError = (error: DefaultError, errorMessage?: string) => {
  const errorResponse = error as unknown as ErrorResponse
  const resolvedErrorMessage = errorMessage || getErrorMessage(errorResponse)

  if (errorResponse.code !== 401) {
    Alert.error(`${resolvedErrorMessage} / ${error.message}`)
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleError(error, query?.meta?.errorMessage as string)
    }
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      handleError(error, mutation?.meta?.errorMessage as string)
    }
  })
})
