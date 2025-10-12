import {
  EditorInitiative,
  clientLoader as initiativeClientLoader
} from '~/features/routes/_shared/EditorInitiative'
import { requireUser } from '~/lib/require-user'

import type { Route } from './+types/initiatives.$id.edit'

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  await requireUser(args.request)
  return initiativeClientLoader(args)
}

export default function InitiativeEditRoute() {
  return <EditorInitiative mode='update' />
}

export function ErrorBoundary() {
  return <EditorInitiative mode='update' />
}
