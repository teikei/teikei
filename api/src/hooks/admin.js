const addFilteredTotal = async (ctx) => {
  if (!ctx.params.skipFilteredTotal) {
    ctx.result.filteredTotal = ctx.result.total
    const count = await ctx.service.find({
      query: { $limit: '0' },
      skipFilteredTotal: true,
    })
    ctx.result.total = count.total
  }
}

export default addFilteredTotal
