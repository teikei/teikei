import Joi from 'joi'

export const networkSchema = {
  name: Joi.string().required()
}

export const networkInitialValues = {
  name: ''
}
