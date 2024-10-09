import { useLocation } from 'react-router-dom'
import { createHashHistory } from 'history'

import { Feature } from './types/types'
import MapContainer from './containers/Map'
import MyEntriesList from './containers/MyEntries'
import DeletePlace from './containers/DeletePlace'
import UserAccount from './containers/UserAccount'
import UserChangePassword from './containers/UserChangePassword'
import UserOnboarding from './containers/UserOnboarding'
import UserRecoverPassword from './containers/UserRecoverPassword'
import ResetPassword from './containers/UserResetPassword/index'
import Layout from './Layout'
import { config } from './main'
import EditorDepot from './containers/Editors/EditorDepot'
import EditorFarm from './containers/Editors/EditorFarm'
import EditorInitiative from './containers/Editors/EditorInitiative'
import { QueryClient } from '@tanstack/react-query'
import { authenticateUser } from './queries/user.ts'

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
export const RECOVER_PASSWORD = '/users/recoverpassword'
export const RESET_PASSWORD = '/users/resetpassword'
export const MY_ENTRIES = '/myentries'

export const history = createHashHistory()

export const useQueryString = () => {
  return new URLSearchParams(useLocation().search)
}

export const getDetailsPath = (feature: Feature, withBaseUrl = true) => {
  const prefix = withBaseUrl ? config.baseUrl : ''
  if (feature.type === 'Feature') {
    const {
      properties: { id, type }
    } = feature
    return `${prefix}/${type.toLowerCase()}s/${id}`
  }
  if (feature.type === 'location') {
    return `${prefix}/locations/${feature.id}`
  }
  const { id, type } = feature
  return `${prefix}/${type}s/${id}`
}
export const getEditPath = (feature: Feature) =>
  `${getDetailsPath(feature, false)}/edit`
export const getDeletePath = (feature: Feature) =>
  `${getDetailsPath(feature, false)}/delete`

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

export const rootLoader = (queryClient: QueryClient) => async () => {
  const response = queryClient.fetchQuery({
    queryKey: ['authenticate'],
    queryFn: () => authenticateUser()
  })
  return response
}

export default function getRoutes(queryClient: QueryClient) {
  const routes = [
    {
      element: <Layout />,
      loader: rootLoader(queryClient),
      children: [
        {
          path: NEW_DEPOT,
          element: <EditorDepot mode='create' />
        },
        {
          path: NEW_FARM,
          element: <EditorFarm mode='create' />
        },
        {
          path: NEW_INITIATIVE,
          element: <EditorInitiative mode='create' />
        },
        {
          path: EDIT_DEPOT,
          element: <EditorDepot mode='update' />
        },
        {
          path: EDIT_FARM,
          element: <EditorFarm mode='update' />
        },
        {
          path: EDIT_INITIATIVE,
          element: <EditorInitiative mode='update' />
        },
        {
          path: DELETE_DEPOT,
          element: <DeletePlace type='depots' />
        },
        {
          path: DELETE_FARM,
          element: <DeletePlace type='farms' />
        },
        {
          path: DELETE_INITIATIVE,
          element: <DeletePlace type='initiatives' />
        },
        {
          path: EDIT_USER_ACCOUNT,
          element: <UserAccount />
        },
        {
          path: EDIT_USER_PASSWORD,
          element: <UserChangePassword />
        },
        { path: RECOVER_PASSWORD, element: <UserRecoverPassword /> },
        { path: RESET_PASSWORD, element: <ResetPassword /> },
        {
          path: MY_ENTRIES,
          element: <MyEntriesList />
        },
        { path: SHOW_POSITION, element: <MapContainer mode='position' /> },
        { path: SHOW_PLACE, element: <MapContainer mode='place' /> },
        { path: MAP, element: <MapContainer mode='map' /> }
      ]
    },
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: SIGN_IN, element: <UserOnboarding /> }, // TODO these routes are not protected
        { path: SIGN_UP, element: <UserOnboarding signUp /> } //  TODO these routes are not protected
      ]
    }
  ]

  return routes
}
