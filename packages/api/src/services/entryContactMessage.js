import { permalink } from '../hooks/email'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default (app) => {
  const service = {
    create: async (data) => {
      const { id, type, senderName, senderEmail, text } = data

      if (!senderName || !senderEmail || !text) {
        throw new Error(
          'validation failed, please provide senderName, senderEmail and text'
        )
      }

      const entry = await app
        .service(`${type.toLowerCase()}s`)
        .get(id, { query: { $eager: 'ownerships' } })

      entry.properties.ownerships.forEach((owner) => {
        app.service('emails').create({
          template: 'entry_contact_message',
          message: {
            to: owner.email,
            replyTo: senderEmail
          },
          locals: {
            locale: owner.locale,
            recipient: owner,
            user: owner,
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

  app.service('entrycontactmessage').hooks({
    before: {
      create: []
    },
    after: {
      create: [filterAllowedFields]
    }
  })
}
