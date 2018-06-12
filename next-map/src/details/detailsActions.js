import Alert from 'react-s-alert'
import { history, MAP } from '../AppRouter'
import request, { formSubmitter } from '../common/request'
import config from '../configuration'
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
  formSubmitter(
    request.post(`${config.apiBaseUrl}/send_message.json`, payload),
    response => dispatch(sendPlaceMessageSuccess(response)),
    response => dispatch(sendPlaceMessageError(response))
  )

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
  //
  // request
  //   .get(`${config.apiBaseUrl}/${type}/${id}`)
  //   .then(result => dispatch(showPlaceSuccess(result.body)))
  //   .catch(showPlaceError)

  dispatch(client[type].get(id))
}

export const hidePlace = () => dispatch => {
  // TODO only reset service of currently shown place
  dispatch(client.depots.reset())
  dispatch(client.farms.reset())
  dispatch(client.initiatives.reset())
  // return { type: HIDE_PLACE }
}
