import type { HookContext } from '@feathersjs/feathers'

const setNow = (field: string) => (ctx: HookContext) => {
  ctx.data[field] = new Date().toISOString()
}

export const setCreatedAt = setNow('createdAt')

export const setUpdatedAt = setNow('updatedAt')
