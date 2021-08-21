import React from 'react'
import { Card, CardContent } from '@material-ui/core'
/* eslint-disable import/no-webpack-loader-syntax */
import ApiDocs from '!babel-loader!@mdx-js/loader!./../content/apidocs.mdx'

const DocsPage = () => (
  <Card>
    <CardContent>
      <ApiDocs />
    </CardContent>
  </Card>
)

export default DocsPage
