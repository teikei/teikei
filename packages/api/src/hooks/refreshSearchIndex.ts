import type { HookContext } from '@feathersjs/feathers'

const refreshSearchIndex = (ctx: HookContext) => {
  ctx.app.service('searchindex').create({})
  // return early, refresh in background
  return ctx
}

export default refreshSearchIndex
