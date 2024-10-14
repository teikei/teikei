import Alert from 'react-s-alert'
import { Outlet, useRouteError } from 'react-router'

export const Component = () => {
  return (
    <div>
      <Outlet />
      <Alert
        stack={{ limit: 3 }}
        position='top-left'
        timeout={5000}
        effect='stackslide'
        offset={80}
        html
      />
    </div>
  )
}
Component.displayName = 'Root'

// TODO implement ErrorBoundary
export const ErrorBoundary = () => {
  const error = useRouteError()

  return <div>Something went wrong: {error.toString()}</div>
}
ErrorBoundary.displayName = 'RootErrorBoundary'
