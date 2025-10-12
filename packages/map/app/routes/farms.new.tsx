import type { Route } from './+types/farms.new'

import {
  EditorFarm,
  clientLoader as farmClientLoader
} from '~/features/routes/_shared/EditorFarm'

export const clientLoader = (args: Route.ClientLoaderArgs) =>
  farmClientLoader(args)

export default function FarmCreateRoute() {
  return <EditorFarm mode='create' />
}

export function ErrorBoundary() {
  return <EditorFarm mode='create' />
}
