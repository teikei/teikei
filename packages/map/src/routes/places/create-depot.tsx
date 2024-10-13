import { loader as depotLoader, EditorDepot } from '../_shared/EditorDepot'

export const loader = depotLoader

export const Component = () => {
  return <EditorDepot mode='create' />
}

export const ErrorBoundary = Component
