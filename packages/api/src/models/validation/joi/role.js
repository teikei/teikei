import Joi from 'joi'

export const role = {
  name: Joi.string().max(255).trim().required()
}
