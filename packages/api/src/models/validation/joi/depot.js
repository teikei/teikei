import Joi from 'joi'
import { entryDetails, entryInitialValues } from './entry.js'

export const depot = {
  ...entryDetails,
  farms: Joi.array().items(Joi.number().required(), Joi.number()),
  deliveryDays: Joi.string().max(255).allow('').allow(null) // legacy,
}

export const depotAdmin = {
  ...depot,
  ownerships: Joi.array().items(Joi.number())
}

export const depotInitialValues = {
  ...entryInitialValues,
  farms: [],
  deliveryDays: ''
}
