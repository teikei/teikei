import Joi from 'joi'
import { entryDetails, entryInitialValues } from './entry.js'

export const initiative = {
  ...entryDetails,
  goals: Joi.array().items(Joi.number()),
  badges: Joi.array().items(Joi.number()).required()
}

export const initiativeAdmin = {
  ...initiative,
  ownerships: Joi.array().items(Joi.number())
}
export const initiativeInitialValues = {
  ...entryInitialValues,
  goals: [],
  badges: []
}
