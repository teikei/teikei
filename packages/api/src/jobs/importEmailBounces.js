import axios from 'axios'
import User from '../models/users'

const JOB_NAME = 'import email bounces'
const SCHEDULE_NIGHTLY_AT_1AM = '0 1 * * * '

const POSTMARK_GET_SUPPRESSIONS_URL =
  'https://api.postmarkapp.com/message-streams/broadcast/suppressions/dump'

export default (app) => {
  const suppressionNameMapping = {
    HardBounce: 'Hard Bounce',
    ManualSuppression: 'Unsubscribed',
  }

  const getNameForSuppressionReason = (suppression) =>
    suppressionNameMapping[suppression] || 'unknown'

  const importSuppressions = async (token) => {
    const result = await axios.get(POSTMARK_GET_SUPPRESSIONS_URL, {
      headers: {
        'X-Postmark-Server-Token': token,
      },
    })
    if (
      result === undefined ||
      result.data === undefined ||
      result.data.Suppressions === undefined ||
      result.data.Suppressions.length === 0
    ) {
      app.info('no suppressions found to import')
    } else {
      await Promise.all(
        result.data.Suppressions.map(
          async ({ EmailAddress, SuppressionReason }) => {
            const user = await User.query().where('email', EmailAddress)
            if (user.length > 0) {
              const userId = user[0].id
              app.info(`recording suppression info on user ${userId}`)
              app.service('users').patch(userId, {
                bounce_type: SuppressionReason,
                bounce_name: getNameForSuppressionReason(SuppressionReason),
              })
            } else {
              app.info(`user ${EmailAddress} not found`)
            }
          }
        )
      )
    }
  }

  app.jobs.schedule(8, JOB_NAME, SCHEDULE_NIGHTLY_AT_1AM, async () => {
    app.info(`CRON: ${JOB_NAME} - starting`)
    const { transport } = app.get('mailer')
    if (app.isProduction() && transport === 'postmarkTransport') {
      app.info('importing bounces from Postmark Production server')
      const token = app.get('mailer').postmarkTransport.auth.apiKey
      await importSuppressions(token)
    } else if (transport === 'postmarkSandboxTransport') {
      app.info('importing bounces from Postmark Sandbox server')
      const token = app.get('mailer').postmarkSandboxTransport.auth.apiKey
      await importSuppressions(token)
    } else {
      app.info(
        `transport ${transport} is not a valid Postmark transport. Skipping import.`
      )
    }
    app.info(`CRON: ${JOB_NAME} - done`)
  })
}
