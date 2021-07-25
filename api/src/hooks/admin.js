export const addFilteredTotal = async (ctx) => {
  if (!ctx.params.skipFilteredTotal) {
    ctx.result.filteredTotal = ctx.result.total
    const count = await ctx.service.find({
      query: { $limit: '0' },
      skipFilteredTotal: true,
    })
    ctx.result.total = count.total
  }
}

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

export const transformAutocompleteQuery = (queryAttribute) => async (ctx) => {
  const query = ctx.params.query
  if (query) {
    if (query.q) {
      ctx.params.query[queryAttribute] = { $ilike: `%${ctx.params.query.q}%` }
      delete ctx.params.query.q
    } else if (query.name) {
      ctx.params.query.name = { $ilike: `%${ctx.params.query.name}%` }
    }
  }
  return ctx
}
