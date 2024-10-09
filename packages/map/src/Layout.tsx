import Alert from 'react-s-alert'
import { Outlet, useLoaderData } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { authenticateUser } from './queries/user.ts'
import { rootLoader } from './routes.tsx'

const Layout = () => {
  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof rootLoader>>
  >
  const response = useQuery({
    queryKey: ['authenticate'],
    queryFn: () => authenticateUser(),
    initialData
  })
  console.log('response', response)
  console.log('initialData', initialData)

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

export default Layout
