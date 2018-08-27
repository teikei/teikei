import Joi from 'joi'

import { entryDetails, entryInitialValues } from './entry'

export const initiativeSchema = {
  ...entryDetails,
  goals: Joi.array().items(Joi.number())
}

export const initiativeInitialValues = {
  ...entryInitialValues,
  goals: []
}

