import { type RouteConfig, index, route } from '@react-router/dev/routes'

export const MAP = '/'
export const NEW_DEPOT = '/depots/new'
export const NEW_FARM = '/farms/new'
export const NEW_INITIATIVE = '/initiatives/new'
export const EDIT_DEPOT = '/depots/:id/edit'
export const EDIT_FARM = '/farms/:id/edit'
export const EDIT_INITIATIVE = '/initiatives/:id/edit'
export const DELETE_DEPOT = '/depots/:id/delete'
export const DELETE_FARM = '/farms/:id/delete'
export const DELETE_INITIATIVE = '/initiatives/:id/delete'
export const SIGN_IN = '/users/sign-in'
export const SIGN_UP = '/users/sign-up'
export const EDIT_USER_ACCOUNT = '/users/editAccount'
export const EDIT_USER_PASSWORD = '/users/editPassword'
export const RECOVER_PASSWORD = '/users/recoverpassword'
export const RESET_PASSWORD = '/users/resetpassword'
export const MY_ENTRIES = '/myentries'

export default [
  index('features/map/pages/map.tsx', { id: 'index' }),
  route(':mapType', 'features/map/pages/map.tsx', { id: 'mapType' }, [
    route(':mapParams', 'features/map/pages/map.tsx', { id: 'mapParams' })
  ]),
  route('depots/new', 'features/entries/pages/new-depot.tsx'),
  route('depots/:id/edit', 'features/entries/pages/edit-depot.tsx'),
  route('depots/:id/delete', 'features/entries/pages/delete-depot.tsx'),
  route('farms/new', 'features/entries/pages/new-farm.tsx'),
  route('farms/:id/edit', 'features/entries/pages/edit-farm.tsx'),
  route('farms/:id/delete', 'features/entries/pages/delete-farm.tsx'),
  route('initiatives/new', 'features/entries/pages/new-initiative.tsx'),
  route('initiatives/:id/edit', 'features/entries/pages/edit-initiative.tsx'),
  route(
    'initiatives/:id/delete',
    'features/entries/pages/delete-initiative.tsx'
  ),
  route('myentries', 'features/entries/pages/my-entries.tsx'),
  route('users/editAccount', 'features/account/pages/edit-account.tsx'),
  route('users/editPassword', 'features/auth/pages/edit-password.tsx'),
  route('users/forgot-password', 'features/auth/pages/forgot-password.tsx'),
  route('users/recoverpassword', 'features/auth/pages/recover-password.tsx'),
  route('users/resetpassword', 'features/auth/pages/reset-password.tsx'),
  route('users/sign-in', 'features/auth/pages/sign-in.tsx'),
  route('users/sign-up', 'features/auth/pages/sign-up.tsx')
] satisfies RouteConfig
