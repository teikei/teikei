import decode from 'jwt-decode'
import { Forbidden } from '@feathersjs/errors'
import { AbilityBuilder, Ability } from '@casl/ability'
import { rulesToQuery } from '@casl/ability/extra'

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
  ctx.app.debug('authorized user', `${ctx.params.user ? ctx.params.user.name : 'anonymous'} with roles`, roles.map(r => r.name))


  const hasRole = role => roles.find(r => r.name === role)

  const { rules, can } = AbilityBuilder.extract()

  if (hasRole(ROLE_SUPERADMIN)) {
    can('manage', 'all')
  }

  if (hasRole(ROLE_ADMIN)) {
    can('manage', 'Depot')
    can('manage', 'Farm')
    can('manage', 'Initiative')
  }

  if (hasRole(ROLE_USER)) {
    // TODO
    can('manage', 'Depot') // if owner
    can('manage', 'Farm') // if owner
    can('manage', 'Initiative') // if owner
    can('manage', 'User') // if owner
    can('read', 'myentries')
  }
  can('read', 'myentries')
  can('read', 'entries')
  can('read', 'farms')
  can('read', 'depots')
  can('read', 'initiatives')
  can('read', 'products')
  can('create', 'authentication')

  can('read', 'Depot')
  can('read', 'Farm')
  can('read', 'Initiative')
  can('read', 'Product')

  return new Ability(rules, { subjectName })
}

const authorize = async ctx => {
  const action = ctx.method
  const service = ctx.service
  const serviceName = ctx.path
  const ability = defineAbilities(ctx)

  const throwUnlessCan = (a, resource) => {
    if (ability.cannot(a, resource)) {
      throw new Forbidden(`You are not allowed to ${a} ${resource}.`)
    }
  }

  // collection request
  if (!ctx.id) {
    const ruleToQuery = rule => {
      // TODO implement this
      console.log('determined rule', rule)
      return null
    }
    const query = rulesToQuery(ability, action, serviceName, ruleToQuery)
    if (query !== null) {
      Object.assign(ctx.params.query, query)
    } else {
      throw new Forbidden(`You are not allowed to ${action} ${serviceName}.`)
    }

    return ctx
  }

  // resource request
  const params = Object.assign({}, ctx.params, { provider: null })

  const result = await service.get(ctx.id, params)

  throwUnlessCan(action, result)

  // avoid calling the service twice for get requests
  if (action === 'get') {
    ctx.result = result
  }

  return ctx
}

export default authorize
