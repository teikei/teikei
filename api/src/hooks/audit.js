const setNow = field => ctx => {
  ctx.data[field] = new Date().toISOString()
}

export const setCreatedAt = setNow('created_at')

export const setUpdatedAt = setNow('updated_at')
