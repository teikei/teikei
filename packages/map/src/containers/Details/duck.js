/*  __
___( o)>
\ <_. )
 `---'
*/
import Alert from 'react-s-alert'
import { client } from '../../main'

export const INIT_SHOW_PLACE_START = 'INIT_SHOW_PLACE_START'
export const INIT_SHOW_PLACE_SUCCESS = 'INIT_SHOW_PLACE_SUCCESS'
export const HIDE_PLACE = 'HIDE_PLACE'

const initialState = {
  feature: null
}

export const details = (state = initialState, action) => {
  switch (action.type) {
    case INIT_SHOW_PLACE_SUCCESS:
      return {
        feature: action.payload
      }

    case HIDE_PLACE:
      return initialState

    default:
      return state
  }
}

const initShowPlaceStart = () => ({ type: INIT_SHOW_PLACE_START })

const showPlaceSuccess = (place) => ({
  type: INIT_SHOW_PLACE_SUCCESS,
  payload: place
})

const showPlaceError = (payload) => {
  Alert.error(`Der Eintrag konnte nicht geladen werden / ${payload.message}`)
}

export const showPlace = (type, id) => (dispatch) => {
  dispatch(initShowPlaceStart())
  client
    .service(type.toLowerCase())
    .get(id)
    .then((res) => dispatch(showPlaceSuccess(res)))
    .catch((e) => dispatch(showPlaceError(e)))
}

export const hidePlace = () => ({ type: HIDE_PLACE })
