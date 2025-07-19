/* eslint-disable import/no-webpack-loader-syntax */
import ApiDocs from '!babel-loader!@mdx-js/loader!./../content/apidocs.mdx'
import { Card, CardContent } from '@mui/material'
import { useAuthenticated } from 'react-admin'

const DocsPage = () => {
  useAuthenticated()
  return (
    <Card>
      <CardContent>
        <ApiDocs />
      </CardContent>
    </Card>
  )
}

export default DocsPage
