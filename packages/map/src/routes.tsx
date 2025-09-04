import { useCallback } from 'react'

// TODO code splitting and lazy loading
import * as Root from './root'
import * as Map from './routes/map/map'
import * as CreateDepot from './routes/places/create-depot'
import * as CreateFarm from './routes/places/create-farm'
import * as CreateInitiative from './routes/places/create-initiative'
import * as DeleteDepot from './routes/places/delete-depot'
import * as DeleteFarm from './routes/places/delete-farm'
import * as DeleteInitiative from './routes/places/delete-initiative'
import * as EditDepot from './routes/places/edit-depot'
import * as EditFarm from './routes/places/edit-farm'
import * as EditInitiative from './routes/places/edit-initiative'
import * as MyEntries from './routes/places/myentries'
import * as ProtectedRoute from './routes/protected-route'
import * as EditAccount from './routes/users/edit-account'
import * as EditPassword from './routes/users/edit-password'
import * as RecoverPassword from './routes/users/recover-password'
import * as ResetPassword from './routes/users/reset-password'
import * as SignIn from './routes/users/signin'
import * as SignUp from './routes/users/signup'

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
// TODO casing is inconsistent
export const RECOVER_PASSWORD = '/users/recoverpassword'
export const RESET_PASSWORD = '/users/resetpassword'
export const MY_ENTRIES = '/myentries'

export const useQueryString = () => {
  // use browser's built-in URLSearchParams to parse the query string
  // because react-router's useLocation().search is empty on first page load
  // when used with hash router
  const getQueryString = useCallback(() => {
    // TODO this is necessary, because currently the query string is often added
    // after the hash (instead of before)
    const search =
      window.location.search || window.location.hash.split('?')[1] || ''
    console.log('search', search)
    return new URLSearchParams(search)
  }, [])
  const clearQueryString = useCallback(() => {
    window.history.replaceState({}, '', window.location.pathname)
  }, [])
  return { getQueryString, clearQueryString }
}

export default function getRoutes() {
  return [
    {
      element: <Root.Component />,
      loader: Root.loader,
      errorElement: <Root.ErrorBoundary />,
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
          loader: ProtectedRoute.loader,
          children: [
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
              path: MY_ENTRIES,
              element: <MyEntries.Component />,
              loader: MyEntries.loader
            }
          ]
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
          // place mode: /depots/:id, /farms/:id, /initiatives/:id, shows place detail
          // position mode: /position/:lat,:lon, shows map at position
          // map mode: /, shows map
          path: '/:mapType?/:mapParams?',
          element: <Map.Component />,
          loader: Map.loader
        }
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
}
