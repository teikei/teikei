import {
  EditorDepot,
  clientLoader as depotClientLoader
} from '~/features/entries/pages/editor-depot'

import type { Route } from '../../../../app/features/entries/pages/+types/new-depot'

export const clientLoader = (args: Route.ClientLoaderArgs) =>
  depotClientLoader(args)

export default function DepotCreateRoute() {
  return <EditorDepot mode='create' />
}

export function ErrorBoundary() {
  return <EditorDepot mode='create' />
}
