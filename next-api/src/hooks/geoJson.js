export const wrapFeatureCollection = ctx => {
  const features = ctx.result
  ctx.result =
    features && features.length > 0
      ? {
          type: 'FeatureCollection',
          features
        }
      : {}
  return ctx
}
