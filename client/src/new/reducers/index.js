import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import user from './user'

// -- teikei state shape:
//
// {
//   user: {
//     currentUser: user,
//     loggedIn: true/false
//   }
//   form: {}
// }


const rootReducer = combineReducers({
  user,
  form: formReducer,
})

export default rootReducer
