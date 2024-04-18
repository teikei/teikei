export const convertVerifyDatesToISOStrings = (ctx) => {
  if (ctx.data.verifyExpires) {
    ctx.data.verifyExpires = new Date(ctx.data.verifyExpires).toISOString()
  }
  if (ctx.data.resetExpires) {
    ctx.data.resetExpires = new Date(ctx.data.resetExpires).toISOString()
  }
}

export const convertVerifyDatesFromISOStrings = (ctx) => {
  if (ctx.result.verifyExpires) {
    ctx.result.verifyExpires = new Date(ctx.result.verifyExpires).getTime()
  }
  if (ctx.result.resetExpires) {
    ctx.result.resetExpires = new Date(ctx.result.resetExpires).getTime()
  }
}
