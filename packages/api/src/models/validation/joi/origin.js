import Joi from 'joi'

export const origin = {
  origin: Joi.string().max(255).trim().required(),
  baseurl: Joi.string().max(255).trim().required(),
  originName: Joi.string().max(255).trim().required(),
  organizationName: Joi.string().max(255).trim().required(),
  organizationEmail: Joi.string().max(255).trim().required()
}
