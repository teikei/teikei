import * as React from 'react'
import { Route } from 'react-router-dom'
import { Authenticated } from 'react-admin'

import DocsPage from './components/DocsPage'

export default [
  <Route key={1} exact path="/docs">
    <Authenticated>
      <DocsPage />
    </Authenticated>
  </Route>,
]
