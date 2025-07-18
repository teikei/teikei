import Joi from 'joi-browser'
import { entryDetails, entryInitialValues } from '@/common/validation/joi/entry'

export const initiativeSchema = {
  ...entryDetails,
  goals: Joi.array().items(Joi.number()),
  badges: Joi.array().items(Joi.number()).required()
}

export const initiativeInitialValues = {
  ...entryInitialValues,
  goals: [],
  badges: []
}
