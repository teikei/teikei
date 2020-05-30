import { iff, isProvider } from 'feathers-hooks-common'

const setNow = (field) => (ctx) => {
  ctx.data[field] = new Date().toISOString()
}

export const setCreatedAt = iff(isProvider('rest'), setNow('createdAt'))

export const setUpdatedAt = iff(isProvider('rest'), setNow('updatedAt'))
