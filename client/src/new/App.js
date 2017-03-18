import React from 'react'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import user from './user/userReducer'
import editor from './editors/editorReducer'
import geocoder from './geocoder/geocoderReducer'
import map from './map/mapReducer'
import search from './search/searchReducer'
import AppRouter from './AppRouter'
import './App.css'

const reducer = combineReducers({
  user,
  editor,
  geocoder,
  map,
  search,
  form: formReducer,
})

const enhancers = compose(
  applyMiddleware(thunk),
  window.devToolsExtension ? window.devToolsExtension() : f => f,
)

const store = createStore(
  reducer,
  enhancers,
)
const App = () => (
  <div className="teikei-embed">
    <Provider store={store}>
      <AppRouter dispatch={store.dispatch} />
    </Provider>
  </div>
)

export default App;
