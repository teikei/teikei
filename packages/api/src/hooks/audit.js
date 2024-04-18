const setNow = (field) => (ctx) => {
  ctx.data[field] = new Date().toISOString()
}

export const setCreatedAt = setNow("createdAt")

export const setUpdatedAt = setNow("updatedAt")
