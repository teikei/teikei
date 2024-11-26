import { depot, depotAdmin, depotInitialValues } from './joi/depot'
import { farm, farmAdmin, farmInitialValues } from './joi/farm'
import {
  initiative,
  initiativeAdmin,
  initiativeInitialValues
} from './joi/initiative'
import { origin } from './joi/origin'
import { role } from './joi/role'
import {
  changePassword,
  changeUserAccount,
  recoverPassword,
  resetPassword,
  user,
  userAdmin,
  userInitialValues,
  userSignUp
} from './joi/user'

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
