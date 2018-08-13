const wrapFeatureCollection = ctx => {
  ctx.result = {
    type: 'FeatureCollection',
    features: ctx.result
  }
  return ctx
}

export default wrapFeatureCollection
