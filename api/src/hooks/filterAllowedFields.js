import _ from 'lodash'

const filterAllowedFields = ctx => {
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

  if (_.isArray(ctx.result)) {
    ctx.result.forEach(e => filter(e))
  } else {
    filter(ctx.result)
  }
}

export default filterAllowedFields
