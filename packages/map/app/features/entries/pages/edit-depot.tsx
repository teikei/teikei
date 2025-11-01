import DepotForm from '~/features/entries/components/depot-form'
import {
  clientLoader as depotClientLoader,
  useDepotEditor
} from '~/features/entries/hooks/use-depot-editor'
import { requireUser } from '~/lib/require-user'

import type { Route } from '../../../../app/features/entries/pages/+types/edit-depot'

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  await requireUser(args.request)
  return depotClientLoader(args)
}

interface DepotEditorRouteProps {
  mode: 'create' | 'update'
}

const DepotEditorRoute = ({ mode }: DepotEditorRouteProps) => {
  const { title, handleSubmit, farms, initialValues, user } = useDepotEditor({
    mode
  })

  const DepotReduxForm = DepotForm as any

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>{title}</h1>
        <DepotReduxForm
          onSubmit={handleSubmit}
          farms={farms}
          initialValues={initialValues}
          user={user}
        />
      </div>
    </div>
  )
}

export default function DepotEditRoute() {
  return <DepotEditorRoute mode='update' />
}

export function ErrorBoundary() {
  return <DepotEditorRoute mode='update' />
}
