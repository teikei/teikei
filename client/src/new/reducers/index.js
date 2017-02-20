import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import user from './user'
import entry from './entry'

// -- teikei state shape:
//
// {
//   user: {
//     currentUser: obj,
//     loggedIn: bool
//   }
//   entry: {
//     currentEntry: obj,
//     isEditing: bool
//   }
//   form: obj
// }

const rootReducer = combineReducers({
  user,
  entry,
  form: formReducer,
})

export default rootReducer
