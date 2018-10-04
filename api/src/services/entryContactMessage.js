import { permalink } from '../hooks/email'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default app => {
  const service = {
    create: async data => {
      const { id, type, senderName, senderEmail, text } = data

      const entry = await app
        .service(`${type.toLowerCase()}s`)
        .get(id, { query: { $eager: 'ownerships' } })

      entry.properties.ownerships.forEach(owner => {
        app.service('emails').create({
          template: 'entry_contact_message',
          message: {
            to: owner.email,
          },
          locals: {
            recipient: owner,
            entry,
            permalink: permalink(owner, entry),
            message: {
              senderName,
              senderEmail,
              text
            }
          }
        })
      })
      return data
    }
  }

  app.use('/entrycontactmessage', service)

  app
    .service('entrycontactmessage')
    .hooks({
      before: {
        all: [],
        create: []
      },
      after: {
        all: [],
        create: []
      },
      error: {
        all: [],
        create: []
      }
    })
    .hooks({
      after: {
        all: [filterAllowedFields]
      }
    })
}
