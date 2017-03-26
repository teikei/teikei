import superagent from 'superagent'
import superagentPromise from 'superagent-promise'
import { SubmissionError } from 'redux-form'

const request = superagentPromise(superagent, Promise)

export const formSubmitter = (apiCall, successAction, errorAction) => new Promise((resolve) => {
  apiCall
    .then(res => resolve(res))
    .catch(res => resolve(res))
}).then((res) => {
  if (!res.ok) {
    errorAction(res.body)
    throw new SubmissionError(res.body)
  }
  successAction(res.body)
})

export default request
