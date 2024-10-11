import { loader as farmLoader, EditorFarm } from '../_shared/EditorFarm'

export const loader = farmLoader

export const Component = () => {
  return <EditorFarm mode='update' />
}
