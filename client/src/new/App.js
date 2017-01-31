import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import browserHistory from './browserHistory'
import Step1 from './components/Step1'
// import Step2 from './components/Step2'
// import Step3 from './components/Step3'
import Map from './components/Map'
import MultiForm from './components/MultiForm'
import DepotDetails from './components/details/DepotDetails'
import FarmDetails from './components/details/FarmDetails'

const RootElement = () => (
  <Router history={browserHistory}>
    <Route path="/new/entry" component={MultiForm}>
      <IndexRoute component={Step1} />
    </Route>
    <Route path="/new/depots/:id" component={DepotDetails} />
    <Route path="/new/farms/:id" component={FarmDetails} />
    <Route path="/new" component={Map} />
  </Router>
)

const App = () => (
  <RootElement />
)

export default App;
