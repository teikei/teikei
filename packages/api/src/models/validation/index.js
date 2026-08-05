import { depot, depotAdmin, depotInitialValues } from './joi/depot.js'
import { farm, farmAdmin, farmInitialValues } from './joi/farm.js'
import {
  initiative,
  initiativeAdmin,
  initiativeInitialValues
} from './joi/initiative.js'
import { origin } from './joi/origin.js'
import { role } from './joi/role.js'
import {
  changePassword,
  changeUserAccount,
  recoverPassword,
  resetPassword,
  user,
  userAdmin,
  userInitialValues,
  userSignUp
} from './joi/user.js'

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
