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

const subjectName = (subject) =>
  !subject || typeof subject === 'string' ? subject : subject.type()

const extractRolesFromJwtToken = (ctx) => {
  if (ctx.params.headers && ctx.params.headers.authorization) {
    return decode(ctx.params.headers.authorization).roles
  }
  if (ctx.result && ctx.result.accessToken) {
    return decode(ctx.result.accessToken).roles
  }
  return []
}

const defineAbilities = (ctx) => {
  const roles = extractRolesFromJwtToken(ctx)

  if (!ctx.params.user) {
    ctx.params.user = {
      id: -1,
      name: 'guest',
    }
  }

  const userId = ctx.params.user.id

  ctx.app.debug(
    roles.length > 0 ? roles.map((r) => r.name) : 'none',
    `authorized user ${userId} ${ctx.params.user.name} with roles`
  )

  const hasRole = (role) => roles.find((r) => r.name === role)

  const { rules, can } = AbilityBuilder.extract()

  const WRITABLE_DEPOT_ATTRIBUTES = [
    'name',
    'postalcode',
    'city',
    'state',
    'country',
    'latitude',
    'longitude',
    'description',
    'url',
    'farms',
    'deliveryDays',
  ]
  const READABLE_DEPOT_ATTRIBUTES = [
    ...WRITABLE_DEPOT_ATTRIBUTES,
    'id',
    'type',
    'link',
    'createdAt',
    'updatedAt',
  ]

  const WRITABLE_FARM_ATTRIBUTES = [
    'name',
    'postalcode',
    'city',
    'state',
    'country',
    'latitude',
    'longitude',
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
    'products',
    'badges',
  ]
  const READABLE_FARM_ATTRIBUTES = [
    ...WRITABLE_FARM_ATTRIBUTES,
    'id',
    'type',
    'link',
    'createdAt',
    'updatedAt',
  ]

  const WRITABLE_INITIATIVE_ATTRIBUTES = [
    'name',
    'postalcode',
    'city',
    'state',
    'country',
    'latitude',
    'longitude',
    'description',
    'url',
    'goals',
    'badges',
  ]
  const READABLE_INITIATIVE_ATTRIBUTES = [
    ...WRITABLE_INITIATIVE_ATTRIBUTES,
    'id',
    'type',
    'link',
    'createdAt',
    'updatedAt',
  ]

  // admin backend: API permissions
  if (hasRole(ROLE_SUPERADMIN)) {
    can('manage', 'admin/goals')
    can('manage', 'admin/badges')
    can('manage', 'admin/products')
  } else if (hasRole(ROLE_ADMIN)) {
    can('read', 'admin/goals')
    can('read', 'admin/badges')
    can('read', 'admin/products')
  }
  if (hasRole(ROLE_SUPERADMIN) || hasRole(ROLE_ADMIN)) {
    can('manage', 'admin/farms')
    can('manage', 'admin/depots')
    can('manage', 'admin/initiatives')
    can('manage', 'admin/users')
    can('read', 'admin/roles')
    can('read', 'admin/jobs')
  }

  // admin backend: main navigation menu permissions
  if (hasRole(ROLE_SUPERADMIN)) {
    can('read', 'admin/menu/farms')
    can('read', 'admin/menu/depots')
    can('read', 'admin/menu/initiatives')
    can('read', 'admin/menu/users')
    can('read', 'admin/menu/goals')
    can('read', 'admin/menu/badges')
    can('read', 'admin/menu/roles')
    can('read', 'admin/menu/products')
    can('read', 'admin/menu/jobs')
  } else if (hasRole(ROLE_ADMIN)) {
    can('read', 'admin/menu/farms')
    can('read', 'admin/menu/depots')
    can('read', 'admin/menu/initiatives')
    can('read', 'admin/menu/users')
  }

  // job queue UI
  if (hasRole(ROLE_SUPERADMIN)) {
    can('read', 'arena')
  }

  // app
  if (hasRole(ROLE_USER) || hasRole(ROLE_ADMIN) || hasRole(ROLE_SUPERADMIN)) {
    can('create', 'autocomplete')
    can('create', 'geocoder')
    can('read', 'entries')

    can('read', 'farms', READABLE_FARM_ATTRIBUTES)
    can('read', 'farms', ['address'], { ownerships: userId })
    can('create', 'farms', WRITABLE_FARM_ATTRIBUTES)
    can(['update', 'delete'], 'farms', READABLE_FARM_ATTRIBUTES, {
      ownerships: userId,
      active: true,
    })

    can('read', 'depots', READABLE_DEPOT_ATTRIBUTES)
    can('read', 'depots', ['address'], { ownerships: userId })
    can('create', 'depots', WRITABLE_DEPOT_ATTRIBUTES)
    can(['update', 'delete'], 'depots', WRITABLE_DEPOT_ATTRIBUTES, {
      ownerships: userId,
      active: true,
    })

    can('read', 'initiatives', READABLE_INITIATIVE_ATTRIBUTES)
    can('read', 'initiatives', ['address'], { ownerships: userId })
    can('create', 'initiatives', WRITABLE_INITIATIVE_ATTRIBUTES)
    can(['update', 'delete'], 'initiatives', WRITABLE_INITIATIVE_ATTRIBUTES, {
      ownerships: userId,
      active: true,
    })

    can('read', 'products')
    can('read', 'goals')
    can('read', 'badges')
  } else {
    // guest
    can('create', 'autocomplete')
    can('create', 'geocoder')
    can('read', 'entries')
    can('read', 'farms', READABLE_FARM_ATTRIBUTES)
    can('read', 'depots', READABLE_DEPOT_ATTRIBUTES)
    can('read', 'initiatives', READABLE_INITIATIVE_ATTRIBUTES)
    can('read', 'products')
    can('read', 'goals')
    can('read', 'badges')
  }

  // login
  can('create', 'authentication')
  // confirm email
  can('create', 'authManagement')
  // sign up
  can('create', 'users')
  // access own user account
  can('patch', 'users', { id: userId })
  can('read', 'users', { id: userId })
  // submit entry contact form
  can('create', 'entrycontactmessage')

  return new Ability(rules, { subjectName })
}

const registeredConditions = ['ownerships']

const checkCondition = (condition) => {
  switch (condition) {
    case 'ownerships':
      return (resource, value) =>
        resource.properties.ownerships.some((o) => o.id === value.toString())
    default:
      return (resource, value) => resource[condition] === value
  }
}

const checkConditions = (resource, conditions) =>
  _.keys(conditions).every((name) =>
    checkCondition(name)(resource, conditions[name])
  )

export const authorize = async (ctx) => {
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
    // check field permissions
    // TODO also implement field level conditions?
    const allowedFields = permittedFieldsOf(ability, action, serviceName)

    if (allowedFields.length > 0) {
      ctx.allowedFields = allowedFields
    }
    return ctx
  }

  // fetch the resource with required eager queries
  const allConditions = Object.assign(
    {},
    ...ability.rulesFor(action, serviceName).map((r) => r.conditions)
  )

  const eager = _.keys(allConditions).filter((name) =>
    registeredConditions.includes(name)
  )
  const resource = await service.get(ctx.id, {
    query: { $eager: `[${eager.join(',')}]` },
    provider: null,
  })

  // check resource rules that apply to the entire resource, not fields
  const resourceConditions = Object.assign(
    {},
    ...ability
      .rulesFor(action, serviceName)
      .filter((r) => !r.fields)
      .map((r) => r.conditions)
  )

  if (resourceConditions && !checkConditions(resource, resourceConditions)) {
    throw new Forbidden(
      `You are not allowed to ${action} ${resource.properties.type} ${resource.properties.id}.`
    )
  }

  // check field permissions (with possible field-level conditions)
  const allowedFields = permittedFieldsOf(ability, action, serviceName, {
    fieldsFrom: (rule) => {
      if (rule.conditions) {
        return checkConditions(ctx.id, resource, rule.conditions)
          ? rule.fields
          : []
      }
      return rule.fields
    },
  })

  if (allowedFields.length > 0) {
    ctx.allowedFields = allowedFields
    const forbiddenFields = _.keys(
      _.pickBy(ctx.data, (value, key) => allowedFields.includes(key))
    )
    if (forbiddenFields.length > 0) {
      throw new Forbidden(
        `You are not allowed to write fields ${forbiddenFields} of ${resource.type}`
      )
    }
  }

  return ctx
}

export const addAbilitiesToResponse = (ctx) => {
  ctx.result.abilities = defineAbilities(ctx).rules
}
