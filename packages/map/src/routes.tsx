import { useLocation } from 'react-router-dom'

export const MAP = '/'
export const SHOW_PLACE = '/:type/:id'
export const SHOW_POSITION = '/position/:lat,:lon'
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
// TODO casing is inconsistent
export const RECOVER_PASSWORD = '/users/recoverpassword'
export const RESET_PASSWORD = '/users/resetpassword'
export const MY_ENTRIES = '/myentries'

export const useQueryString = () => {
  // use browser's built-in URLSearchParams to parse the query string
  // becauase react-router's useLocation().search is empty on first page load
  // when used with hash router
  const search = window.location.search
  return new URLSearchParams(search)
}

// TODO: implement ProtectedRoute as loader
// const ProtectedRoute = ({ children, ...rest }: PropsWithChildren) => {
//   const { currentUser } = useGlobalState()
//   return (
//     <Route
//       {...rest}
//       render={(props) =>
//         currentUser ? (
//           children
//         ) : (
//           <Navigate
//             to='/users/sign-in'
//             state={{ from: props.location }}
//             replace
//           />
//         )
//       }
//     />
//   )
// }

export default function getRoutes() {
  const routes = [
    {
      lazy: () => import('./root'),
      id: 'root',
      children: [
        {
          path: NEW_DEPOT,
          lazy: () => import('./routes/places/create-depot')
        },
        {
          path: NEW_FARM,
          lazy: () => import('./routes/places/create-farm')
        },
        {
          path: NEW_INITIATIVE,
          lazy: () => import('./routes/places/create-initiative')
        },
        {
          path: EDIT_DEPOT,
          lazy: () => import('./routes/places/edit-depot')
        },
        {
          path: EDIT_FARM,
          lazy: () => import('./routes/places/edit-farm')
        },
        {
          path: EDIT_INITIATIVE,
          lazy: () => import('./routes/places/edit-initiative')
        },
        {
          path: DELETE_DEPOT,
          lazy: () => import('./routes/places/delete-depot')
        },
        {
          path: DELETE_FARM,
          lazy: () => import('./routes/places/delete-farm')
        },
        {
          path: DELETE_INITIATIVE,
          lazy: () => import('./routes/places/delete-initiative')
        },
        {
          path: EDIT_USER_ACCOUNT,
          lazy: () => import('./routes/users/edit-account')
        },
        {
          path: EDIT_USER_PASSWORD,
          lazy: () => import('./routes/users/edit-password')
        },
        {
          path: RECOVER_PASSWORD,
          lazy: () => import('./routes/users/recover-password')
        },
        {
          path: RESET_PASSWORD,
          lazy: () => import('./routes/users/reset-password')
        },
        {
          path: MY_ENTRIES,
          lazy: () => import('./routes/places/myentries')
        },
        {
          path: SHOW_POSITION,
          lazy: () => import('./routes/map/map-position')
        },
        {
          path: SHOW_PLACE,
          lazy: () => import('./routes/map/map-place-detail')
        },
        { path: MAP, lazy: () => import('./routes/map/map') }
      ]
    },
    {
      path: '/',
      lazy: () => import('./root'),
      children: [
        { path: SIGN_IN, lazy: () => import('./routes/users/signin') }, // TODO these routes are not protected
        { path: SIGN_UP, lazy: () => import('./routes/users/signup') } //  TODO these routes are not protected
      ]
    }
  ]

  return routes
}
