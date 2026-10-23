import type { HookContext } from '@feathersjs/feathers'

const filterAllowedFields = (ctx: HookContext) => {
  if (!ctx.allowedFields) {
    return
  }

  // `type` and `link` always stay, as the write scopes don't list them.
  const allowed = [...ctx.allowedFields, 'type', 'link']
  const filter = (o: Record<string, unknown>) =>
    Object.keys(o).forEach((key) => {
      if (!allowed.includes(key)) {
        // cannot use pickBy as we want to keep the object prototype intact

        delete o[key]
      }
    })

  if (Array.isArray(ctx.result)) {
    ctx.result.forEach((e) => filter(e))
  } else {
    filter(ctx.result)
  }
}

export default filterAllowedFields
