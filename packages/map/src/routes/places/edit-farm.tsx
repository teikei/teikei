import { EditorFarm, loader as farmLoader } from '../_shared/EditorFarm'

export const loader = farmLoader

export const Component = () => {
  return <EditorFarm mode='update' />
}

export const ErrorBoundary = Component
