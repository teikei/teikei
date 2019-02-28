const refreshSearchIndex = ctx => {
  ctx.app.service('searchindex').create({})
  // return early, refresh in background
  return ctx
}

export default refreshSearchIndex
