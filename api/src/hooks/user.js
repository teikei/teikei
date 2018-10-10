import bcrypt from 'bcrypt'
import { iff, isProvider, preventChanges } from 'feathers-hooks-common'
import errors from '@feathersjs/errors'
import { transaction } from 'objection'
import _ from 'lodash'

import User from '../models/users'
import Role from '../models/roles'

export const setOrigin = ctx => {
  ctx.data.origin = _.get(ctx.params.headers, 'origin')
}

export const assignUserRole = async ctx => {
  console.log("ctx", ctx);

  await transaction(User.knex(), async trx => {
    const user = await User.query(trx).findById(ctx.result.id)
    const role = await Role.query(trx).where({ name: 'user' })
    user.$relatedQuery('roles', trx).unrelate()
    await user.$relatedQuery('roles', trx).relate(role)
  })
}

export const protectUserFields = iff(
  isProvider('external'),
  preventChanges(
    true,
    'password',
    'isVerified',
    'verifyToken',
    'verifyShortToken',
    'verifyExpires',
    'verifyChanges',
    'resetToken',
    'resetShortToken',
    'resetExpires'
  )
)

export const validateUserPassword = iff(isProvider('external'), async ctx => {
  const {
    data: { password },
    params: { user }
  } = ctx
  if (!password) {
    throw new errors.NotAuthenticated('Missing password for verification')
  }
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw new errors.NotAuthenticated('Password incorrect')
  }
  delete ctx.data.password
  ctx.id = user.id
  return ctx
})

export default setOrigin
