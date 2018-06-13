// TODO why are timestamps stored as UTC when created like this?
export const setCreatedAt = ctx => {
  const now = new Date()
  ctx.data.created_at = now
  ctx.data.updated_at = now
}

export const setUpdatedAt = ctx => {
  ctx.data.updated_at = new Date()
}
