import Joi from 'joi'

export const entry = {
  id: Joi.number(), // server only
  legacyId: Joi.number().allow(null), // server only
  type: Joi.string(), // server only
  link: Joi.string(), // server only
  name: Joi.string()
    .max(255)
    .trim()
    .required(),
  city: Joi.string()
    .max(255)
    .trim()
    .required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required()
}

export const entryDetails = {
  ...entry,
  createdAt: Joi.date().iso(), // server only
  updatedAt: Joi.date()
    .iso()
    .allow(null), // server only
  address: Joi.string()
    .trim()
    .allow('') // legacy (force address to be included in geocoder?)
    .allow(null), // legacy
  description: Joi.string()
    .allow('')
    .allow(null), // legacy
  url: Joi.string()
    .max(255)
    .uri()
    .allow('')
    .allow(null) // legacy
    .trim()
}


export const entryInitialValues = {
  name: '',
  city: '',
  latitude: null,
  longitude: null,
  address: '',
  description: '',
  url: ''
}
