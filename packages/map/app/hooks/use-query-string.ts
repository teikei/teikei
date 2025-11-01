import { useCallback } from 'react'

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
