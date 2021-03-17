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

export const mapResultListRelationsToIds = (relations) => async (ctx) => {
  if (ctx.result.data) {
    ctx.result.data = ctx.result.data.map((obj) => mapRelationsToIds(obj, relations))
  }
  return ctx
}

export const mapResultRelationsToIds = (relations) => async (ctx) => {
  if (ctx.result) {
    ctx.result = mapRelationsToIds(ctx.result, relations)
  }
}

