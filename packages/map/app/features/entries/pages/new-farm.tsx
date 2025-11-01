import {
  EditorFarm,
  clientLoader as farmClientLoader
} from '~/features/entries/pages/editor-farm'

import type { Route } from '../../../routes/+types/farms.new'

export const clientLoader = (args: Route.ClientLoaderArgs) =>
  farmClientLoader(args)

export default function FarmCreateRoute() {
  return <EditorFarm mode='create' />
}

export function ErrorBoundary() {
  return <EditorFarm mode='create' />
}
