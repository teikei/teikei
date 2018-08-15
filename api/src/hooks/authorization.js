import decode from 'jwt-decode'
import { Forbidden } from '@feathersjs/errors'
import { Ability, AbilityBuilder } from '@casl/ability'
import { iff } from 'feathers-hooks-common'
import _ from 'lodash'

Ability.addAlias('update', 'patch')
Ability.addAlias('read', ['get', 'find'])
Ability.addAlias('delete', 'remove')

// hardcoded roles that must match roles defined in database (for now)
const ROLE_USER = 'user'
const ROLE_ADMIN = 'admin'
const ROLE_SUPERADMIN = 'superadmin'

const subjectName = subject =>
  !subject || typeof subject === 'string' ? subject : subject.type()

const extractRolesFromJwtToken = ctx =>
  ctx.params.headers && ctx.params.headers.authorization
    ? decode(ctx.params.headers.authorization).roles
    : []

const defineAbilities = ctx => {
  const roles = extractRolesFromJwtToken(ctx)

  if (!ctx.params.user) {
    ctx.params.user = {
      id: -1,
      name: 'anonymous'
    }
  }

  ctx.app.debug(
    'authorized user',
    `${ctx.params.user.name} with roles`,
    roles.length > 0 ? roles.map(r => r.name) : 'none'
  )

  const hasRole = role => roles.find(r => r.name === role)

  const { rules, can } = AbilityBuilder.extract()

  if (hasRole(ROLE_SUPERADMIN)) {
    can('manage', 'all')
  }

  if (hasRole(ROLE_ADMIN)) {
    can('manage', 'farms')
    can('manage', 'depots')
    can('manage', 'initiatives')
  }

  if (hasRole(ROLE_USER)) {
    const userId = ctx.params.user.id
    can('manage', 'farms', { ownerships: userId })
    can('manage', 'depots', { ownerships: userId })
    can('manage', 'initiatives', { ownerships: userId })
  }

  can('read', 'entries')
  can('read', 'farms')
  can('read', 'depots')
  can('read', 'initiatives')
  can('read', 'products')
  can('create', 'authentication')

  return new Ability(rules, { subjectName })
}

export const authorize = async ctx => {
  const action = ctx.method
  const service = ctx.service
  const serviceName = ctx.path
  const ability = defineAbilities(ctx)

  const throwUnlessCan = (a, resource) => {
    if (ability.cannot(a, resource)) {
      throw new Forbidden(`You are not allowed to ${a} ${resource}.`)
    }
  }

  throwUnlessCan(action, serviceName)

  // collection request
  if (!ctx.id) {
    // TODO also implement condition filter for collections?
    return ctx
  }

  // resource request
  const conditions = Object.assign(
    {},
    ...ability.rulesFor(action, serviceName).map(r => r.conditions)
  )

  const eager = _.keys(conditions).filter(name => name === 'ownerships')

  const resource = await service.get(ctx.id, {
    query: { $eager: `[${eager.join(',')}]` },
    provider: null
  })

  if (!checkConditions(ctx.id, resource, conditions)) {
    throw new Forbidden(`You are not allowed to ${action} ${resource.type()} ${resource.id}.`)
  }

  return ctx
}

const filterFor = condition => {
  switch (condition) {
    case 'ownerships':
      return (resource, value) =>
        resource.ownerships.some(o => o.id === value.toString())
    default:
      return (resource, value) => resource[condition] === value
  }
}

const checkConditions = (id, resource, conditions) => {
  return _.keys(conditions).every(name =>
    filterFor(name)(resource, conditions[name])
  )
}
