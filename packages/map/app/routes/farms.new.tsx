import {
  EditorFarm,
  clientLoader as farmClientLoader
} from '~/features/routes/_shared/EditorFarm'

import type { Route } from './+types/farms.new'

export const clientLoader = (args: Route.ClientLoaderArgs) =>
  farmClientLoader(args)

export default function FarmCreateRoute() {
  return <EditorFarm mode='create' />
}

export function ErrorBoundary() {
  return <EditorFarm mode='create' />
}
