import {
  EditorDepot,
  clientLoader as depotClientLoader
} from '~/features/entries/pages/editor-depot'
import { requireUser } from '~/lib/require-user'

import type { Route } from '../../../../app/features/entries/pages/+types/edit-depot'

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  await requireUser(args.request)
  return depotClientLoader(args)
}

export default function DepotEditRoute() {
  return <EditorDepot mode='update' />
}

export function ErrorBoundary() {
  return <EditorDepot mode='update' />
}
