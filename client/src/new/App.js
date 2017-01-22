import React from 'react'
import {Router, Route, browserHistory, IndexRoute} from 'react-router'
import Step1 from './components/Step1'
import Step2 from './components/Step2'
import Step3 from './components/Step3'
import Map from './components/Map'
import MultiForm from './components/MultiForm'

const RootElement = () => (
  <Router history={browserHistory}>
    <Route path="/new/entry" component={MultiForm}>
      <IndexRoute component={Step1} />
      <Route path="/new/entry/step2" component={Step2} />
      <Route path="/new/entry/step3" component={Step3} />
    </Route>
    <Route path="/new" component={Map} />
  </Router>
)

const App = () => (
  <RootElement />
)

export default App;
