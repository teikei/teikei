import { depotInitialValues, depotSchema } from './joi/depot'
import { farmInitialValues, farmSchema } from './joi/farm'
import { initiativeInitialValues, initiativeSchema } from './joi/initiative'
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
