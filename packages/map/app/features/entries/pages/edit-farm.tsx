import FarmForm from '~/features/entries/components/farm-form'
import {
  clientLoader as farmClientLoader,
  useFarmEditor
} from '~/features/entries/hooks/use-farm-editor'
import { requireUser } from '~/lib/require-user'

import type { Route } from '../../../../app/features/entries/pages/+types/edit-farm'

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  await requireUser(args.request)
  return farmClientLoader(args)
}

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

export default function FarmEditRoute() {
  return <FarmEditorRoute mode='update' />
}

export function ErrorBoundary() {
  return <FarmEditorRoute mode='update' />
}
