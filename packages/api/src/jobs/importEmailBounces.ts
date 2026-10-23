import type { Application } from '@feathersjs/feathers'
import axios from 'axios'
import { createUsersDomain } from '../domain/users.ts'
import { logger } from '../logger.ts'

const JOB_NAME = 'import email bounces'
const SCHEDULE_NIGHTLY_AT_1AM = '0 1 * * * '

const POSTMARK_GET_SUPPRESSIONS_URL =
  'https://api.postmarkapp.com/message-streams/broadcast/suppressions/dump'

type Suppression = { EmailAddress: string; SuppressionReason: string }

export default (app: Application) => {
  const users = createUsersDomain(app.get('kysely'))

  const suppressionNameMapping: Record<string, string> = {
    HardBounce: 'Hard Bounce',
    ManualSuppression: 'Unsubscribed'
  }

  const getNameForSuppressionReason = (suppression: string) =>
    suppressionNameMapping[suppression] || 'unknown'

  const importSuppressions = async (token: string) => {
    const result = await axios.get<{ Suppressions?: Suppression[] }>(
      POSTMARK_GET_SUPPRESSIONS_URL,
      {
        headers: {
          'X-Postmark-Server-Token': token
        }
      }
    )
    if (
      result === undefined ||
      result.data === undefined ||
      result.data.Suppressions === undefined ||
      result.data.Suppressions.length === 0
    ) {
      logger.info('no suppressions found to import')
    } else {
      await Promise.all(
        result.data.Suppressions.map(
          async ({ EmailAddress, SuppressionReason }) => {
            const userId = await users.recordBounce(EmailAddress, {
              bounceType: SuppressionReason,
              bounceName: getNameForSuppressionReason(SuppressionReason)
            })
            if (userId) {
              logger.info(`recorded suppression info on user ${userId}`)
            } else {
              logger.info(`user ${EmailAddress} not found`)
            }
          }
        )
      )
    }
  }

  app.jobs.schedule(8, JOB_NAME, SCHEDULE_NIGHTLY_AT_1AM, async () => {
    logger.info(`CRON: ${JOB_NAME} - starting`)
    const { transport } = app.get('mailer')
    if (app.isProduction() && transport === 'postmarkTransport') {
      logger.info('importing bounces from Postmark Production server')
      const token = app.get('mailer').postmarkTransport.auth.apiKey
      await importSuppressions(token)
    } else if (transport === 'postmarkSandboxTransport') {
      logger.info('importing bounces from Postmark Sandbox server')
      const token = app.get('mailer').postmarkSandboxTransport.auth.apiKey
      await importSuppressions(token)
    } else {
      logger.info(
        `transport ${transport} is not a valid Postmark transport. Skipping import.`
      )
    }
    logger.info(`CRON: ${JOB_NAME} - done`)
  })
}
