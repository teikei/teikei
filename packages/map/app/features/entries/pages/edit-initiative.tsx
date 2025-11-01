import {
  EditorInitiative,
  clientLoader as initiativeClientLoader
} from '~/features/entries/pages/editor-initiative'
import { requireUser } from '~/lib/require-user'

import type { Route } from '../../../../app/features/entries/pages/+types/edit-initiative'

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
