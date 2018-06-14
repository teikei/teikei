export const convertVerifyExpirationDates = ctx => {
  if (ctx.data.verifyExpires) {
    ctx.data.verifyExpires = new Date(ctx.data.verifyExpires).toISOString()
  }
  if (ctx.data.resetExpires) {
    ctx.data.resetExpires = new Date(ctx.data.resetExpires).toISOString()
  }
}

export const sendConfirmationEmail = async ctx => {
  await ctx.app.service('emails').create({
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
