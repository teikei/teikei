import { applyMiddleware, combineReducers, createStore } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { thunk } from 'redux-thunk'

export const createAppStore = () =>
  createStore(
    combineReducers({
      form: formReducer
    }),
    applyMiddleware(thunk)
  )
