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
    if (query['badges.id']) {
      // add badges join relation, if there is an active badges filter
      ctx.params.query.$joinRelation = 'badges'
    }
    if (query['roles.id']) {
      ctx.params.query.$select = '[]'
      // add roles join relation, if there is an active roles filter
      ctx.params.query.$joinRelation = 'roles'
    }
  }
  return ctx
}
