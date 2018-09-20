import decode from 'jwt-decode'
import { Forbidden } from '@feathersjs/errors'
import { Ability, AbilityBuilder } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
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

const extractRolesFromJwtToken = ctx => {
  if (ctx.params.headers && ctx.params.headers.authorization) {
    return decode(ctx.params.headers.authorization).roles
  }
  if (ctx.result && ctx.result.accessToken) {
    return decode(ctx.result.accessToken).roles
  }
  return []
}

const defineAbilities = ctx => {
  const roles = extractRolesFromJwtToken(ctx)

  if (!ctx.params.user) {
    ctx.params.user = {
      id: -1,
      name: 'guest'
    }
  }

  const userId = ctx.params.user.id

  ctx.app.debug(
    roles.length > 0 ? roles.map(r => r.name) : 'none',
    `authorized user ${userId} ${ctx.params.user.name} with roles`
  )

  const hasRole = role => roles.find(r => r.name === role)

  const { rules, can } = AbilityBuilder.extract()

  // admin backend
  if (hasRole(ROLE_SUPERADMIN)) {
    can('manage', 'admin/farms')
    can('manage', 'admin/depots')
    can('manage', 'admin/initiatives')
    can('manage', 'admin/goals')
    can('manage', 'admin/users')
    can('manage', 'admin/products')
  } else if (hasRole(ROLE_ADMIN)) {
    // TODO: can manage entities in admin backend, but no user accounts/roles
  }

  // app
  if (hasRole(ROLE_USER)) {
    can('create', 'autocomplete')
    can('create', 'geocoder')
    can('read', 'entries')
    can(['read', 'create'], 'farms')
    can('create', 'farms')
    can('read', 'farms', [
      'id',
      'name',
      'city',
      'latitude',
      'longitude',
      'createdAt',
      'updatedAt',
      'description',
      'url',
      'depots',
      'acceptsNewMembers',
      'foundedAtYear',
      'foundedAtMonth',
      'maximumMembers',
      'additionalProductInformation',
      'participation',
      'actsEcological',
      'economicalBehavior',
      'products'
    ])
    can('read', 'farms', ['address'], { ownerships: userId })
    can(['read'], 'farms')
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
    can('read', 'farms', [
      'id',
      'name',
      'city',
      'latitude',
      'longitude',
      'createdAt',
      'updatedAt',
      'description',
      'url',
      'depots',
      'acceptsNewMembers',
      'foundedAtYear',
      'foundedAtMonth',
      'maximumMembers',
      'additionalProductInformation',
      'participation',
      'actsEcological',
      'economicalBehavior',
      'products'
    ])
    can('read', 'depots')
    can('read', 'initiatives')
    can('read', 'products')
    can('read', 'goals')
  }

  // login
  can('create', 'authentication')
  // confirm email
  can('create', 'authManagement')
  // sign up
  can('create', 'users')
  // edit user account
  can('patch', 'users', { id: userId })

  return new Ability(rules, { subjectName })
}

const filterFor = condition => {
  switch (condition) {
    case 'ownerships':
      return (resource, value) =>
        resource.properties.ownerships.some(o => o.id === value.toString())
    default:
      return (resource, value) => resource[condition] === value
  }
}

const checkConditions = (id, resource, conditions) =>
  _.keys(conditions).every(name => filterFor(name)(resource, conditions[name]))

export const authorize = async ctx => {
  const { method: action, service, path: serviceName } = ctx
  const ability = defineAbilities(ctx)

  const throwUnlessCan = (a, resource) => {
    if (ability.cannot(a, resource)) {
      throw new Forbidden(`You are not allowed to ${a} ${resource}.`)
    }
  }

  // check service permissions
  throwUnlessCan(action, serviceName)

  // allow collection requests (read, create)
  if (!ctx.id) {
    // TODO also implement condition filter for collections?
    return ctx
  }

  // fetch the resource with required eager queries
  const allConditions = Object.assign(
    {},
    ...ability.rulesFor(action, serviceName).map(r => r.conditions)
  )

  const eager = _.keys(allConditions).filter(name => name === 'ownerships')
  const resource = await service.get(ctx.id, {
    query: { $eager: `[${eager.join(',')}]` },
    provider: null
  })

  // check resource rules that apply to the entire resource, not fields
  const resourceConditions = Object.assign(
    {},
    ...ability
      .rulesFor(action, serviceName)
      .filter(r => !r.fields)
      .map(r => r.conditions)
  )

  if (
    resourceConditions &&
    !checkConditions(ctx.id, resource, resourceConditions)
  ) {
    throw new Forbidden(
      `You are not allowed to ${action} ${resource.properties.type} ${
        resource.properties.id
      }.`
    )
  }

  // check field permissions (with possible field-level conditions)
  const allowedFields = permittedFieldsOf(ability, action, serviceName, {
    fieldsFrom: rule => {
      if (rule.conditions) {
        return checkConditions(ctx.id, resource, rule.conditions)
          ? rule.fields
          : []
      }
      return rule.fields
    }
  })

  if (allowedFields.length > 0) {
    ctx.allowedFields = allowedFields
    const forbiddenFields = _.keys(
      _.pickBy(ctx.data, (value, key) => allowedFields.includes(key))
    )
    if (forbiddenFields.length > 0) {
      throw new Forbidden(
        `You are not allowed to write fields ${forbiddenFields} of ${
          resource.type
        }`
      )
    }
  }

  return ctx
}

export const addAbilitiesToResponse = ctx => {
  const abilities = defineAbilities(ctx)
  console.log("abilities", abilities);

  ctx.result.abilities = abilities.rules
  ctx.result.foo = 'far'
}
