import {
  EditorDepot,
  loader as depotLoader
} from '@/routes/_shared/EditorDepot'

export const loader = depotLoader

export const Component = () => {
  return <EditorDepot mode='create' />
}

export const ErrorBoundary = Component
