import { useCallback } from 'react'

// TODO code splitting and lazy loading
import * as Root from './root'
import * as CreateDepot from './routes/places/create-depot'
import * as CreateFarm from './routes/places/create-farm'
import * as CreateInitiative from './routes/places/create-initiative'
import * as EditDepot from './routes/places/edit-depot'
import * as EditFarm from './routes/places/edit-farm'
import * as EditInitiative from './routes/places/edit-initiative'
import * as DeleteDepot from './routes/places/delete-depot'
import * as DeleteFarm from './routes/places/delete-farm'
import * as DeleteInitiative from './routes/places/delete-initiative'
import * as EditAccount from './routes/users/edit-account'
import * as EditPassword from './routes/users/edit-password'
import * as RecoverPassword from './routes/users/recover-password'
import * as ResetPassword from './routes/users/reset-password'
import * as MyEntries from './routes/places/myentries'
import * as MapPosition from './routes/map/map-position'
import * as MapPlaceDetail from './routes/map/map-place-detail'
import * as Map from './routes/map/map'
import * as SignIn from './routes/users/signin'
import * as SignUp from './routes/users/signup'

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
  const getQueryString = useCallback(() => {
    // TODO this is necessary, because currently the query string is often added
    // after the hash (instead of before)
    const search =
      window.location.search || window.location.hash.split('?')[1] || ''
    return new URLSearchParams(search)
  }, [])
  const clearQueryString = useCallback(() => {
    window.history.replaceState({}, '', window.location.pathname)
  }, [])
  return { getQueryString, clearQueryString }
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
      element: <Root.Component />,
      loader: Root.loader,
      id: 'root',
      children: [
        {
          path: NEW_DEPOT,
          element: <CreateDepot.Component />,
          loader: CreateDepot.loader
        },
        {
          path: NEW_FARM,
          element: <CreateFarm.Component />,
          loader: CreateFarm.loader
        },
        {
          path: NEW_INITIATIVE,
          element: <CreateInitiative.Component />,
          loader: CreateInitiative.loader
        },
        {
          path: EDIT_DEPOT,
          element: <EditDepot.Component />,
          loader: EditDepot.loader
        },
        {
          path: EDIT_FARM,
          element: <EditFarm.Component />,
          loader: EditFarm.loader
        },
        {
          path: EDIT_INITIATIVE,
          element: <EditInitiative.Component />,
          loader: EditInitiative.loader
        },
        {
          path: DELETE_DEPOT,
          element: <DeleteDepot.Component />,
          loader: DeleteDepot.loader
        },
        {
          path: DELETE_FARM,
          element: <DeleteFarm.Component />,
          loader: DeleteFarm.loader
        },
        {
          path: DELETE_INITIATIVE,
          element: <DeleteInitiative.Component />,
          loader: DeleteInitiative.loader
        },
        {
          path: EDIT_USER_ACCOUNT,
          element: <EditAccount.Component />
        },
        {
          path: EDIT_USER_PASSWORD,
          element: <EditPassword.Component />
        },
        {
          path: RECOVER_PASSWORD,
          element: <RecoverPassword.Component />
        },
        {
          path: RESET_PASSWORD,
          element: <ResetPassword.Component />
        },
        {
          path: MY_ENTRIES,
          element: <MyEntries.Component />,
          loader: MyEntries.loader
        },
        {
          path: SHOW_POSITION,
          element: <MapPosition.Component />,
          loader: MapPosition.loader
        },
        {
          path: SHOW_PLACE,
          element: <MapPlaceDetail.Component />,
          loader: MapPlaceDetail.loader
        },
        { path: MAP, element: <Map.Component />, loader: Map.loader }
      ]
    },
    {
      path: '/',
      element: <Root.Component />,
      loader: Root.loader,
      children: [
        { path: SIGN_IN, element: <SignIn.Component /> }, // TODO these routes are not protected
        { path: SIGN_UP, element: <SignUp.Component /> } //  TODO these routes are not protected
      ]
    }
  ]

  return routes
}
