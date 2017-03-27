import Alert from 'react-s-alert'
import { history, MAP } from '../AppRouter'
import request, { formSubmitter } from '../common/request'
import config from '../configuration'

export const FETCH_PLACE_REQUESTED = 'FETCH_PLACE_REQUESTED'
export const FETCH_PLACE_SUCCESS = 'FETCH_PLACE_SUCCESS'

export const sendPlaceMessageSuccess = () => () => {
  Alert.closeAll()
  Alert.success('Deine Nachricht wurde versandt!')
  history.push(MAP);
}

export const sendPlaceMessageError = () => () => {
  Alert.closeAll()
  Alert.error('Deine Nachricht konnte nicht versandt werden. Bitte überprüfe Deine Angaben.')
}

export const sendPlaceMessage = payload => dispatch => formSubmitter(
  request.post(`${config.apiBaseUrl}/send_message.json`, payload),
  response => dispatch(sendPlaceMessageSuccess(response)),
  response => dispatch(sendPlaceMessageError(response)),
)

const fetchPlaceRequested = () =>
  ({ type: FETCH_PLACE_REQUESTED })

const fetchPlaceSuccess = place =>
  ({ type: FETCH_PLACE_SUCCESS, payload: place })

const fetchPlaceError = (payload) => {
  Alert.error(`Der Eintrag konnte nicht geladen werden / ${payload.message}`)
}

export const showPlace = (type, id) => (dispatch) => {
  dispatch(fetchPlaceRequested())

  request
    .get(`${config.apiBaseUrl}/${type}/${id}`)
    .then(result => dispatch(fetchPlaceSuccess(result.body)))
    .catch(fetchPlaceError)
}

