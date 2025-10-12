import { useCallback } from 'react'

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
    return new URLSearchParams(search)
  }, [])
  const clearQueryString = useCallback(() => {
    window.history.replaceState({}, '', window.location.pathname)
  }, [])
  return { getQueryString, clearQueryString }
}
