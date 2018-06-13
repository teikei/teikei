import superagent from 'superagent'
import superagentPromise from 'superagent-promise'
import { SubmissionError } from 'redux-form'
import i18n from '../i18n'

const request = superagentPromise(superagent, Promise)

const extractValidationErrors = res => {
  const validationErrors = {}
  if (res.body) {
    if (res.body.error) {
      // eslint-disable-next-line no-underscore-dangle
      validationErrors._error = res.body.error
    }
    if (res.body.errors) {
      Object.keys(res.body.errors).forEach(k => {
        validationErrors[k] = res.body.errors[k].join(', ')
      })

      // Add an error message for the geocoder component if lat or lng are not set
      // TODO: Update the API to handle this properly
      if (res.body.errors.latitude || res.body.errors.longitude) {
        validationErrors.geocoder = i18n.t('geocoder.error')
      }
    }
  }
  return validationErrors
}

// wrap superagent-promise in standard JS promise and always resolve it,
// even in error cases. This is required for compatibility with redux-form.
export const formSubmitter = (apiCall, successAction, errorAction) =>
  new Promise(resolve => {
    apiCall.then(res => resolve(res)).catch(({ response }) => resolve(response))
  }).then(res => {
    if (!res.ok) {
      errorAction(res)
      throw new SubmissionError(extractValidationErrors(res))
    }
    successAction(res.body)
  })

export default request
