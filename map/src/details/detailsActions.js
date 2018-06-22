import Alert from 'react-s-alert'
import { history, MAP } from '../AppRouter'
import { client } from '../App'

export const INIT_SHOW_PLACE_START = 'INIT_SHOW_PLACE_START'
export const INIT_SHOW_PLACE_SUCCESS = 'INIT_SHOW_PLACE_SUCCESS'
export const HIDE_PLACE = 'HIDE_PLACE'

export const sendPlaceMessageSuccess = () => () => {
  Alert.closeAll()
  Alert.success('Deine Nachricht wurde versandt!')
  history.push(MAP)
}

export const sendPlaceMessageError = () => () => {
  Alert.closeAll()
  Alert.error(
    'Deine Nachricht konnte nicht versandt werden. Bitte überprüfe Deine Angaben.'
  )
}

export const sendPlaceMessage = payload => dispatch =>
  client
    .service('entrycontactmessage')
    .create(payload)
    .then(res => dispatch(sendPlaceMessageSuccess(res)))
    .catch(e => dispatch(sendPlaceMessageError(e)))

const initShowPlaceStart = () => ({ type: INIT_SHOW_PLACE_START })

const showPlaceSuccess = place => ({
  type: INIT_SHOW_PLACE_SUCCESS,
  payload: place
})

const showPlaceError = payload => {
  Alert.error(`Der Eintrag konnte nicht geladen werden / ${payload.message}`)
}

export const showPlace = (type, id) => dispatch => {
  dispatch(initShowPlaceStart())
  client
    .service(type)
    .get(id)
    .then(res => dispatch(showPlaceSuccess(res)))
    .catch(e => dispatch(showPlaceError(e)))
}

export const hidePlace = () => ({ type: HIDE_PLACE })
