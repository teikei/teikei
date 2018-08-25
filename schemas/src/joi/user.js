import Joi from 'joi'

export const userSchema = {
  id: Joi.number(), // server only
  type: Joi.string(), // server only
  link: Joi.string(), // server only
  origin: Joi.string()
    .max(255)
    .trim(), // server only
  baseurl: Joi.string()
    .max(255)
    .trim(), // server only
  isVerified: Joi.boolean(), // server only
  verifyToken: Joi.string()
    .max(255)
    .allow(null)
    .trim(), // server only
  verifyShortToken: Joi.string()
    .max(255)
    .allow(null)
    .trim(), // server only
  verifyExpires: Joi.date()
    .iso()
    .allow(null), // server only
  verifyChanges: Joi.object().allow(null), // server only
  resetToken: Joi.string()
    .max(255)
    .allow(null)
    .trim(), // server only
  resetShortToken: Joi.string()
    .max(255)
    .allow(null)
    .trim(), // server only
  resetExpires: Joi.date()
    .iso()
    .allow(null), // server only
  createdAt: Joi.date().iso(), // server only
  updatedAt: Joi.date()
    .iso()
    .allow(null), // server only
  name: Joi.string()
    .max(255)
    .trim(),
  email: Joi.string()
    .max(255)
    .email()
    .trim(),
  phone: Joi.string()
    .max(255)
    .trim(),
  password: Joi.string()
    .max(255)
    .trim()
}

export const userSignUpSchema = {
  name: Joi.string()
    .max(255)
    .trim()
    .required(),
  email: Joi.string()
    .max(255)
    .email()
    .trim()
    .required(),
  phone: Joi.string()
    .max(255)
    .trim(),
  password: Joi.string()
    .max(255)
    .trim()
    .required(),
  passwordConfirmation: Joi.string()
    .max(255)
    .trim()
    .required()
    .valid(Joi.ref('password'))
}

export const recoverPasswordSchema = {
  email: Joi.string()
    .max(255)
    .email()
    .trim()
    .required()
}

export const resetPasswordSchema = {
  password: Joi.string()
    .max(255)
    .trim()
    .required(),
  passwordConfirmation: Joi.string()
    .max(255)
    .trim()
    .required()
    .valid(Joi.ref('password'))
}

export const changeUserAccount = {
  oldPassword: Joi.string()
    .max(255)
    .trim()
    .required(),
  password: Joi.string()
    .max(255)
    .trim()
    .required()
}

export const changeUserAccountSchema = {
  name: Joi.string()
    .max(255)
    .trim()
    .required(),
  email: Joi.string()
    .max(255)
    .email()
    .trim()
    .required(),
  phone: Joi.string()
    .max(255)
    .trim()
    .required()
    .allow(''),
  password: Joi.string()
    .max(255)
    .trim()
    .required()
}

export const changePasswordSchema = {
  password: Joi.string()
    .max(255)
    .trim()
    .required(),
  oldPassword: Joi.string()
    .max(255)
    .trim()
    .required()
}

export const userInitialValues = {
  name: '',
  phone: '',
  email: '',
  password: '',
  passwordConfirmation: ''
}
