import {
  EditorFarm,
  clientLoader as farmClientLoader
} from '~/features/entries/pages/editor-farm'
import { requireUser } from '~/lib/require-user'

import type { Route } from '../../../routes/+types/farms.$id.edit'

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
