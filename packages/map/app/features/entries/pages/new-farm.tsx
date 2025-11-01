import FarmForm from '~/features/entries/components/farm-form'
import {
  clientLoader as farmClientLoader,
  useFarmEditor
} from '~/features/entries/hooks/use-farm-editor'

import type { Route } from '../../../../app/features/entries/pages/+types/new-farm'

export const clientLoader = (args: Route.ClientLoaderArgs) =>
  farmClientLoader(args)

interface FarmEditorRouteProps {
  mode: 'create' | 'update'
}

const FarmEditorRoute = ({ mode }: FarmEditorRouteProps) => {
  const { title, handleSubmit, initialValues, user, products, goals, badges } =
    useFarmEditor({ mode })

  const FarmReduxForm = FarmForm as any

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>{title}</h1>
        <FarmReduxForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          user={user}
          products={products}
          goals={goals}
          badges={badges}
        />
      </div>
    </div>
  )
}

export default function FarmCreateRoute() {
  return <FarmEditorRoute mode='create' />
}

export function ErrorBoundary() {
  return <FarmEditorRoute mode='create' />
}
