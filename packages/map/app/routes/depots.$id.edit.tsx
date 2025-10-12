import type { Route } from './+types/depots.$id.edit'

import {
  EditorDepot,
  clientLoader as depotClientLoader
} from '~/features/routes/_shared/EditorDepot'
import { requireUser } from '~/lib/require-user'

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
