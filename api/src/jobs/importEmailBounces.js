import axios from 'axios'
import User from '../models/users'

const JOB_NAME = 'import email bounces'
const SCHEDULE_NIGHTLY_AT_1AM = '0 1 * * * '

const POSTMARK_GET_BOUNCES_URL = 'https://api.postmarkapp.com/bounces'

const getBouncesPage = async (token, page) => {
  const bounces = await axios.get(
    `${POSTMARK_GET_BOUNCES_URL}?type=HardBounce&inactive=true&count=100&offset=${
      page * 100
    }`,
    {
      headers: {
        'X-Postmark-Server-Token': token,
      },
    }
  )
  return bounces.data
}

export default (app) => {
  const importBounces = async (token) => {
    const allBounces = []
    let currentPage
    let page = 0
    do {
      currentPage = await getBouncesPage(token, page)
      allBounces.push(...currentPage.Bounces)
      page++
    } while (currentPage.Bounces.length > 0)
    await Promise.all(
      allBounces.map(async (bounce) => {
        app.info(`deactivating user ${bounce.Email}`)
        const user = await User.query().where('email', 'admin@example.com')
        if (user.length > 0) {
          app.service('users').patch(user[0].id, {
            state: 'INACTIVE_BOUNCED',
          })
        } else {
          app.info(`user ${bounce.Email} not found`)
        }
      })
    )
  }

  app.jobs.schedule(7, JOB_NAME, SCHEDULE_NIGHTLY_AT_1AM, async () => {
    app.info(`CRON: ${JOB_NAME} - starting`)
    const { transport } = app.get('mailer')
    if (app.isProduction() && transport === 'postmarkTransport') {
      app.info('importing bounces from Postmarkt Production server')
      const token = app.get('mailer').postmarkTransport.auth.apiKey
      await importBounces(token)
    } else if (app.isProduction() && transport === 'postmarkSandboxTransport') {
      app.info('importing bounces from Postmark Sandbox server')
      const token = app.get('mailer').postmarkSandboxTransport.auth.apiKey
      await importBounces(token)
    } else {
      app.info(
        `transport ${transport} is not a valid Postmark transport. Skipping import.`
      )
    }
    app.info(`CRON: ${JOB_NAME} - done`)
  })
}
