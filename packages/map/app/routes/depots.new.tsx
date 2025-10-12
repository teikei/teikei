import {
  EditorDepot,
  clientLoader as depotClientLoader
} from '~/features/routes/_shared/EditorDepot'

import type { Route } from './+types/depots.new'

export const clientLoader = (args: Route.ClientLoaderArgs) =>
  depotClientLoader(args)

export default function DepotCreateRoute() {
  return <EditorDepot mode='create' />
}

export function ErrorBoundary() {
  return <EditorDepot mode='create' />
}
