import superagent from 'superagent'
import superagentPromise from 'superagent-promise'
import { SubmissionError } from 'redux-form'

const request = superagentPromise(superagent, Promise)

export const handleValidationErrors = ({ text }) => {
  const errors = JSON.parse(text).errors
  throw new SubmissionError(errors)
}

export default request
