import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/_index.tsx'),
  route(':mapType', 'routes/$mapType/_index.tsx', [
    route(':mapParams', 'routes/$mapType/$mapParams.tsx')
  ]),
  route('depots/new', 'routes/depots.new.tsx'),
  route('depots/:id/edit', 'routes/depots.$id.edit.tsx'),
  route('depots/:id/delete', 'routes/depots.$id.delete.tsx'),
  route('farms/new', 'routes/farms.new.tsx'),
  route('farms/:id/edit', 'routes/farms.$id.edit.tsx'),
  route('farms/:id/delete', 'routes/farms.$id.delete.tsx'),
  route('initiatives/new', 'routes/initiatives.new.tsx'),
  route('initiatives/:id/edit', 'routes/initiatives.$id.edit.tsx'),
  route('initiatives/:id/delete', 'routes/initiatives.$id.delete.tsx'),
  route('myentries', 'routes/myentries.tsx'),
  route('users/editAccount', 'routes/users.editAccount.tsx'),
  route('users/editPassword', 'routes/users.editPassword.tsx'),
  route('users/forgot-password', 'routes/users.forgot-password.tsx'),
  route('users/recoverpassword', 'routes/users.recoverpassword.tsx'),
  route('users/resetpassword', 'routes/users.resetpassword.tsx'),
  route('users/sign-in', 'routes/users.sign-in.tsx'),
  route('users/sign-up', 'routes/users.sign-up.tsx')
] satisfies RouteConfig
