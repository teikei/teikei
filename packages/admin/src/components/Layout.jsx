import { Layout } from 'react-admin'
import AppBar from './AppBar'
import AppMenu from './AppMenu'

const AppLayout = (props) => (
  <Layout {...props} menu={AppMenu} appBar={AppBar} />
)

export default AppLayout
