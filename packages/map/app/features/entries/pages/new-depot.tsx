import DepotForm from '~/features/entries/components/depot-form'
import {
  depotClientLoader,
  useDepotEditor
} from '~/features/entries/hooks/use-depot-editor'

import type { Route } from '../../../../app/features/entries/pages/+types/new-depot'

export const clientLoader = (args: Route.ClientLoaderArgs) =>
  depotClientLoader(args)

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

export default function DepotCreateRoute() {
  return <DepotEditorRoute mode='create' />
}

export function ErrorBoundary() {
  return <DepotEditorRoute mode='create' />
}
