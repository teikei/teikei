import {
  loader as initiativeLoader,
  EditorInitiative
} from '../_shared/EditorInitiative'

export const loader = initiativeLoader

export const Component = () => {
  return <EditorInitiative mode='update' />
}
