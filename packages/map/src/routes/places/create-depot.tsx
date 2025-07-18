import { loader as depotLoader, EditorDepot } from '@/routes/_shared/EditorDepot'

export const loader = depotLoader

export const Component = () => {
  return <EditorDepot mode='create' />
}

export const ErrorBoundary = Component
