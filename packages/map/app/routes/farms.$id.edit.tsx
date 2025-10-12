import type { Route } from './+types/farms.$id.edit'

import {
  EditorFarm,
  clientLoader as farmClientLoader
} from '~/features/routes/_shared/EditorFarm'
import { requireUser } from '~/lib/require-user'

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  await requireUser(args.request)
  return farmClientLoader(args)
}

export default function FarmEditRoute() {
  return <EditorFarm mode='update' />
}

export function ErrorBoundary() {
  return <EditorFarm mode='update' />
}
