import Joi from 'joi'

export const user = {
  id: Joi.number(), // server only
  type: Joi.string(), // server only
  link: Joi.string(), // server only
  origin: Joi.string().max(255).trim(), // server only
  baseurl: Joi.string().max(255).trim(), // server only
  isVerified: Joi.boolean(), // server only
  verifyToken: Joi.string().max(255).allow(null).trim(), // server only
  verifyShortToken: Joi.string().max(255).allow(null).trim(), // server only
  verifyExpires: Joi.date().iso().allow(null), // server only
  verifyChanges: Joi.object().allow(null), // server only
  resetToken: Joi.string().max(255).allow(null).trim(), // server only
  resetShortToken: Joi.string().max(255).allow(null).trim(), // server only
  resetExpires: Joi.date().iso().allow(null), // server only
  resetAttempts: Joi.number().allow(null), // server only
  createdAt: Joi.date().iso(), // server only
  updatedAt: Joi.date().iso().allow(null), // server only
  bounceType: Joi.string().allow(null), // server only
  bounceName: Joi.string().allow(null), // server only
  name: Joi.string().max(255).trim(),
  email: Joi.string().max(255).email().trim(),
  phone: Joi.string().max(255).trim().allow('').allow(null),
  password: Joi.string().max(255).trim(),
  reminderSentAt: Joi.string().allow(null), // server only
  secondReminderSentAt: Joi.string().allow(null), // server only
  reactivationToken: Joi.string().allow(null), // server only
  state: Joi.string()
    .valid(
      'RECENT_LOGIN',
      'REMINDER_SENT',
      'SECOND_REMINDER_SENT',
      'NO_RESPONSE',
    )
    .max(255),
}

export const userSignUp = {
  name: Joi.string().max(255).trim().required(),
  email: Joi.string().max(255).email().trim().required(),
  phone: Joi.string().max(255).trim(),
  password: Joi.string().max(255).trim().required(),
  passwordConfirmation: Joi.string()
    .max(255)
    .trim()
    .required()
    .valid(Joi.ref('password')),
}

export const userAdmin = {
  ...user,
  roles: Joi.array().items(Joi.number()),
}

export const recoverPassword = {
  email: Joi.string().max(255).email().trim().required(),
}

export const resetPassword = {
  password: Joi.string().max(255).trim().required(),
  passwordConfirmation: Joi.string()
    .max(255)
    .trim()
    .required()
    .valid(Joi.ref('password')),
}

export const changeUserAccount = {
  name: Joi.string().max(255).trim().required(),
  email: Joi.string().max(255).email().trim().required(),
  phone: Joi.string().max(255).trim().required().allow(''),
  password: Joi.string().max(255).trim().required(),
}

export const changePassword = {
  password: Joi.string().max(255).trim().required(),
  oldPassword: Joi.string().max(255).trim().required(),
}

export const userInitialValues = {
  name: '',
  phone: '',
  email: '',
  password: '',
  passwordConfirmation: '',
}
