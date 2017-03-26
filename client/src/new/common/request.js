import superagent from 'superagent'
import superagentPromise from 'superagent-promise'
import { SubmissionError } from 'redux-form'

const request = superagentPromise(superagent, Promise)

// wrap superagent-promise in standard JS promise and always resolve it,
// even in error cases. This is required for compatibility with redux-form.
export const formSubmitter = (apiCall, successAction, errorAction) => new Promise((resolve) => {
  apiCall
    .then(res => resolve(res))
    .catch(({ response }) => resolve(response))
}).then((res) => {
  if (!res.ok) {
    errorAction(res.body)
    const validationErrors = {}
    if (validationErrors.error) {
      // eslint-disable-next-line no-underscore-dangle
      validationErrors._error = res.body.error
    }
    Object.keys(res.body.errors).forEach((k) => {
      validationErrors[k] = res.body.errors[k].join(', ')
    })
    throw new SubmissionError(validationErrors)
  }
  successAction(res.body)
})

export default request
