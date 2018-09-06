import _ from 'lodash'

const filterAllowedFields = ctx => {
  console.log("ctx.allowedFields", ctx.allowedFields);

  if (!ctx.allowedFields) {
    return
  }

  const filter = o =>
    _.keys(o).forEach(key => {
      if (!ctx.allowedFields.includes(key)) {
        // cannot use pickBy as we want to keep the object prototype intact
        // eslint-disable-next-line no-param-reassign
        delete o[key]
      }
    })

  _.isArray(ctx.result)
    ? ctx.result.forEach(e => filter(e))
    : filter(ctx.result)
}

export default filterAllowedFields
