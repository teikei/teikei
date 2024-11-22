import {
  EditorInitiative,
  loader as initiativeLoader
} from '../_shared/EditorInitiative'

export const loader = initiativeLoader

export const Component = () => {
  return <EditorInitiative mode='update' />
}

export const ErrorBoundary = Component
