import {
  EditorInitiative,
  clientLoader as initiativeClientLoader
} from '~/features/routes/_shared/EditorInitiative'

import type { Route } from './+types/initiatives.new'

export const clientLoader = (args: Route.ClientLoaderArgs) =>
  initiativeClientLoader(args)

export default function InitiativeCreateRoute() {
  return <EditorInitiative mode='create' />
}

export function ErrorBoundary() {
  return <EditorInitiative mode='create' />
}
