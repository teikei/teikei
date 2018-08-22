import Joi from 'joi'

const entry = {
  id: Joi.number(), // not writable by client
  legacyId: Joi.number().allow(null), // not writable by client
  type: Joi.string(), // not writable by client
  link: Joi.string(), // not writable by client
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

const entryDetails = {
  ...entry,
  createdAt: Joi.date().iso(), // not writable by client
  updatedAt: Joi.date()
    .iso()
    .allow(null), // not writable by client
  address: Joi.string()
    .trim()
    .required(),
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

const depotSchema = {
  ...entryDetails,
  farms: Joi.array().items(Joi.number().required(), Joi.number()),
  deliveryDays: Joi.string()
    .max(255)
    .allow('')
    .allow(null), // legacy,
}

const farmSchema = {
  ...entryDetails,
  depots: Joi.array().items(Joi.number()), // not writable by client
  acceptsNewMembers: Joi.string()
    .valid('yes', 'no', 'waitlist')
    .required(),
  foundedAtYear: Joi.number().allow(null),
  foundedAtMonth: Joi.number()
    .min(1)
    .max(12)
    .allow(null),
  maximumMembers: Joi.number().allow(null),
  additionalProductInformation: Joi.string()
    .allow('')
    .allow(null), // legacy,
  participation: Joi.string()
    .allow('')
    .allow(null), // legacy
  actsEcological: Joi.boolean().required(),
  economicalBehavior: Joi.string()
    .allow('')
    .allow(null), // legacy
  products: Joi.array()
    .items(Joi.number())
    .required()
}

const initiativeSchema = {
  ...entryDetails,
  goals: Joi.array().items(Joi.number())
}

const entryInitialValues = {
  name: '',
  city: '',
  latitude: null,
  longitude: null,
  address: '',
  description: '',
  url: ''
}

const depotInitialValues = {
  ...entryInitialValues,
  farms: [],
  deliveryDays: ''
}

const farmInitialValues = {
  ...entryInitialValues,
  acceptsNewMembers: 'yes',
  foundedAtYear: null,
  foundedAtMonth: null,
  maximumMembers: null,
  additionalProductInformation: '',
  participation: '',
  actsEcological: false,
  economicalBehavior: '',
  products: []
}

const initiativeInitialValues = {
  ...entryInitialValues,
  goals: []
}

export const schemas = {
  depot: depotSchema,
  farm: farmSchema,
  initiative: initiativeSchema
}

export const initialValues = {
  depot: depotInitialValues,
  farm: farmInitialValues,
  initiative: initiativeInitialValues
}
