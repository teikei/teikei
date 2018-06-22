export const convertVerifyDatesWrite = ctx => {
  if (ctx.data.verifyExpires) {
    ctx.data.verifyExpires = new Date(ctx.data.verifyExpires).toISOString()
  }
  if (ctx.data.resetExpires) {
    ctx.data.resetExpires = new Date(ctx.data.resetExpires).toISOString()
  }
}

export const convertVerifyDatesRead = ctx => {
  if (ctx.result.verifyExpires) {
    ctx.result.verifyExpires = new Date(ctx.result.verifyExpires).getTime()
  }
  if (ctx.result.resetExpires) {
    ctx.result.resetExpires = new Date(ctx.result.resetExpires).getTime()
  }
}

export const sendConfirmationEmail = ctx => {
  ctx.app.service('emails').create({
    template: 'confirmation_instructions',
    to: ctx.result.email,
    locals: {
      // locale: 'en'
      user: ctx.result,
      sender_email: 'kontakt@ernte-teilen.org'
    }
  })
  return ctx
}
