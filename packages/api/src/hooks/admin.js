const mapRelationsToIds = (obj, relations) => {
  relations.forEach((r) => {
    if (obj[r]) {
      obj[r] = obj[r].map((i) => i.id)
    }
  })
  return obj
}

const toArray = (relationExpression) =>
  relationExpression
    .substring(1, relationExpression.length - 1)
    .split(',')
    .map((r) => r.trim())

export const mapResultListRelationsToIds =
  (relationExpression) => async (ctx) => {
    const relations = toArray(relationExpression)
    if (ctx.result.data) {
      ctx.result.data = ctx.result.data.map((obj) =>
        mapRelationsToIds(obj, relations)
      )
    }
    return ctx
  }

export const mapResultRelationsToIds = (relationExpression) => async (ctx) => {
  const relations = toArray(relationExpression)
  if (ctx.result) {
    ctx.result = mapRelationsToIds(ctx.result, relations)
  }
}

export const parseQueryOptions = async (ctx) => {
  ctx.queryOptions = {}
  if (ctx.params.query) {
    ctx.queryOptions.relationsDetails = ctx.params.query.$details === 'true'
    delete ctx.params.query.$details
  }
  return ctx
}

export const buildQueryFromRequest = (queryAttribute) => async (ctx) => {
  const query = ctx.params.query
  if (query) {
    if (query.q) {
      // use 'q' parameter as fuzzy search input for specified 'queryAttribute'
      ctx.params.query[queryAttribute] = { $ilike: `%${ctx.params.query.q}%` }
      delete ctx.params.query.q
    } else {
      if (query.name) {
        // add fuzzy search to 'name' parameter
        ctx.params.query.name = { $ilike: `%${ctx.params.query.name}%` }
      }
      if (query.email) {
        // add fuzzy search to 'name' parameter
        ctx.params.query.email = { $ilike: `%${ctx.params.query.email}%` }
      }
    }
    if (query.hasBadge) {
      ctx.params.query.$modify = ['hasBadge', query.hasBadge]
      delete query.hasBadge
    }
    if (query.notHasBadge) {
      ctx.params.query.$modify = ['notHasBadge', query.notHasBadge]
      delete query.notHasBadge
    }
    if (query['roles.id']) {
      ctx.params.query.$select = '[]'
      // add roles join relation, if there is an active roles filter
      ctx.params.query.$joinRelation = 'roles'
    }
  }
  return ctx
}

export const filterUsersByOriginPermissions = async (ctx) => {
  const { user } = ctx.params
  if (user && !user.roles.map((r) => r.name).includes('superadmin')) {
    ctx.params.query.$or = [
      { origin: { $in: (user.adminOrigins ?? []).map((o) => o.origin) } },
      // users can always see themselves
      { id: { $eq: user.id } }
    ]
  }
  return ctx
}

export const filterEntriesByOriginPermissions = async (ctx) => {
  const { user } = ctx.params

  if (user && !user.roles.map((r) => r.name).includes('superadmin')) {
    ctx.params.query.$modify = [
      'hasOrigin',
      user.adminOrigins.map((o) => o.origin)
    ]
  }
  return ctx
}
