import Alert from 'react-s-alert'
import { history, MAP } from '../AppRouter'
import request, { formSubmitter } from '../common/request'
import config from '../configuration'

export const sendPlaceMessageSuccess = res => () => {
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
