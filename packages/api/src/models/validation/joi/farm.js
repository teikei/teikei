import Joi from 'joi'

import { entryDetails, entryInitialValues } from './entry'

export const farm = {
  ...entryDetails,
  depots: Joi.array().items(Joi.number()), // server only
  acceptsNewMembers: Joi.string().valid('yes', 'no', 'waitlist').required(),
  foundedAtYear: Joi.number().allow(null),
  foundedAtMonth: Joi.number().min(1).max(12).allow(null),
  maximumMembers: Joi.number().allow(null),
  additionalProductInformation: Joi.string().allow('').allow(null), // legacy
  participation: Joi.string().allow('').allow(null), // legacy
  actsEcological: Joi.boolean().required(),
  economicalBehavior: Joi.string().allow('').allow(null), // legacy
  products: Joi.array().items(Joi.number()).required(),
  badges: Joi.array().items(Joi.number()).required()
}

export const farmAdmin = {
  ...farm,
  ownerships: Joi.array().items(Joi.number())
}

export const farmInitialValues = {
  ...entryInitialValues,
  acceptsNewMembers: 'yes',
  foundedAtYear: null,
  foundedAtMonth: null,
  maximumMembers: null,
  additionalProductInformation: '',
  participation: '',
  actsEcological: false,
  economicalBehavior: '',
  products: [],
  badges: []
}
