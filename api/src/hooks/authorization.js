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
      name: 'guest'
    }
  }

  ctx.app.debug(
    roles.length > 0 ? roles.map(r => r.name) : 'none',
    `authorized user ${ctx.params.user.id} ${ctx.params.user.name} with roles`
  )

  const hasRole = role => roles.find(r => r.name === role)

  const { rules, can } = AbilityBuilder.extract()

  // admin backend
  if (hasRole(ROLE_SUPERADMIN)) {
    // TODO: can manage everything in admin backend
  } else if (hasRole(ROLE_ADMIN)) {
    // TODO: can manage entities in admin backend, but no user accounts/roles
  }

  // app
  if (hasRole(ROLE_USER)) {
    const userId = ctx.params.user.id
    can('create', 'autocomplete')
    can('create', 'geocoder')
    can('read', 'entries')
    can(['read', 'create'], 'farms')
    can(['update', 'delete'], 'farms', { ownerships: userId })
    can(['read', 'create'], 'depots')
    can(['update', 'delete'], 'depots', { ownerships: userId })
    can(['read', 'create'], 'initiatives')
    can(['update', 'delete'], 'initiatives', { ownerships: userId })
    can('read', 'products')
    can('read', 'goals')
  } else {
    // guest
    can('create', 'autocomplete')
    can('create', 'geocoder')
    can('read', 'entries')
    can('read', 'farms')
    can('read', 'depots')
    can('read', 'initiatives')
    can('read', 'products')
    can('read', 'goals')
  }

  // everyone can login
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

  // collection request (read, create)
  if (!ctx.id) {
    throwUnlessCan(action, serviceName)
    // TODO also implement condition filter for collections?
    return ctx
  }

  // resource request (update, delete)
  console.log('--- resource request ')
  console.log('serviceName', serviceName)
  console.log('action', action)

  console.log(
    'ability.rulesFor(action, serviceName)',
    ability.rulesFor(action, serviceName)
  )

  const conditions = Object.assign(
    {},
    ...ability.rulesFor(action, serviceName).map(r => r.conditions)
  )

  console.log('conditions', conditions)

  const eager = _.keys(conditions).filter(name => name === 'ownerships')

  const resource = await service.get(ctx.id, {
    query: { $eager: `[${eager.join(',')}]` },
    provider: null
  })

  if (!checkConditions(ctx.id, resource, conditions)) {
    throw new Forbidden(
      `You are not allowed to ${action} ${resource.type()} ${resource.id}.`
    )
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
