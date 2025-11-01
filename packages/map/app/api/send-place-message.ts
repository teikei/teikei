import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { getClient } from '~/lib/clients'
import type { FeatureType } from '~/types/types'

export interface SendPlaceMessageParams {
  id: string
  senderEmail: string
  senderName: string
  text: string
  type: FeatureType
}

export async function sendPlaceMessage(params: SendPlaceMessageParams) {
  return getClient().service('entrycontactmessage').create(params)
}

type SendPlaceMessageData = Awaited<ReturnType<typeof sendPlaceMessage>>

type UseSendPlaceMessageOptions = Omit<
  UseMutationOptions<
    SendPlaceMessageData,
    Error,
    SendPlaceMessageParams,
    unknown
  >,
  'mutationFn'
>

export function useSendPlaceMessage(options?: UseSendPlaceMessageOptions) {
  return useMutation({
    mutationFn: sendPlaceMessage,
    ...options
  })
}
