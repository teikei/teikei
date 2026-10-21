import _ from 'lodash'

const filterAllowedFields = (ctx) => {
  if (!ctx.allowedFields) {
    return
  }

  // `type` and `link` always stay, as the write scopes don't list them.
  const allowed = [...ctx.allowedFields, 'type', 'link']
  const filter = (o) =>
    _.keys(o).forEach((key) => {
      if (!allowed.includes(key)) {
        // cannot use pickBy as we want to keep the object prototype intact

        delete o[key]
      }
    })

  if (_.isArray(ctx.result)) {
    ctx.result.forEach((e) => filter(e))
  } else {
    filter(ctx.result)
  }
}

export default filterAllowedFields
