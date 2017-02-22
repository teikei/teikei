import React from 'react'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import user from './user/userReducer'
import editor from './editors/editorReducer'
import geocoder from './editors/geocoder/geocoderReducer'
import map from './map/mapReducer'

import AppRouter from './AppRouter'

require('./App.css')

const reducer = combineReducers({
  user,
  editor,
  geocoder,
  map,
  form: formReducer,
})

const store = createStore(
  reducer,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f,
  ),
)
const App = () => (
  <Provider store={store}>
    <AppRouter dispatch={store.dispatch} />
  </Provider>
)

export default App;
