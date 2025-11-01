import InitiativeForm from '~/features/entries/components/initiative-form'
import {
  clientLoader as initiativeClientLoader,
  useInitiativeEditor
} from '~/features/entries/hooks/use-initiative-editor'

import type { Route } from '../../../../app/features/entries/pages/+types/new-initiative'

export const clientLoader = (args: Route.ClientLoaderArgs) =>
  initiativeClientLoader(args)

interface InitiativeEditorRouteProps {
  mode: 'create' | 'update'
}

const InitiativeEditorRoute = ({ mode }: InitiativeEditorRouteProps) => {
  const { title, handleSubmit, initialValues, user, goals, badges } =
    useInitiativeEditor({ mode })

  const InitiativeReduxForm = InitiativeForm as any

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>{title}</h1>
        <InitiativeReduxForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          user={user}
          goals={goals}
          badges={badges}
        />
      </div>
    </div>
  )
}

export default function InitiativeCreateRoute() {
  return <InitiativeEditorRoute mode='create' />
}

export function ErrorBoundary() {
  return <InitiativeEditorRoute mode='create' />
}
