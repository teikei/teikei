import { depotSchema, depotInitialValues } from './joi/depot'
import { farmSchema, farmInitialValues } from './joi/farm'
import { initiativeSchema, initiativeInitialValues } from './joi/initiative'
import {
  userSchema,
  userInitialValues,
  userSignUpSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
  changeUserAccountSchema,
  changePasswordSchema,
  entryContactSchema,
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
  entryContact: entryContactSchema,
}

export const initialValues = {
  depot: depotInitialValues,
  farm: farmInitialValues,
  initiative: initiativeInitialValues,
  user: userInitialValues,
}
