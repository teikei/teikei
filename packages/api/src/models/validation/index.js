import { depot, depotAdmin, depotInitialValues } from './joi/depot'
import { farm, farmAdmin, farmInitialValues } from './joi/farm'
import {
  initiative,
  initiativeAdmin,
  initiativeInitialValues
} from './joi/initiative'
import {
  user,
  userAdmin,
  userInitialValues,
  userSignUp,
  recoverPassword,
  resetPassword,
  changeUserAccount,
  changePassword
} from './joi/user'
import { role } from './joi/role'
import { origin } from './joi/origin'

export const schemas = {
  depot,
  farm,
  initiative,
  depotAdmin,
  farmAdmin,
  initiativeAdmin,
  role,
  origin,
  user,
  userAdmin,
  userSignUp,
  recoverPassword,
  resetPassword,
  changeUserAccount,
  changePassword
}

export const initialValues = {
  depotInitialValues,
  farmInitialValues,
  initiativeInitialValues,
  userInitialValues
}
