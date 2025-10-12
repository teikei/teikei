import { depotInitialValues, depotSchema } from '~/common/validation/joi/depot'
import { farmInitialValues, farmSchema } from '~/common/validation/joi/farm'
import {
  initiativeInitialValues,
  initiativeSchema
} from '~/common/validation/joi/initiative'

import {
  changePasswordSchema,
  changeUserAccountSchema,
  entryContactSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
  userInitialValues,
  userSchema,
  userSignUpSchema
} from './joi/user'

export const schemas = {
  depot: depotSchema,
  farm: farmSchema,
  initiative: initiativeSchema,
  user: userSchema,
  signUp: userSignUpSchema,
  recoverPassword: recoverPasswordSchema,
  resetPassword: resetPasswordSchema,
  changeUserAccount: changeUserAccountSchema,
  changePassword: changePasswordSchema,
  entryContact: entryContactSchema
}

export const initialValues = {
  depot: depotInitialValues,
  farm: farmInitialValues,
  initiative: initiativeInitialValues,
  user: userInitialValues
}
