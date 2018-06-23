import { permalink } from '../hooks/email'

export default app => {
  const service = {
    create: async data => {
      const { id, type, senderName, senderEmail, text } = data

      const entry = await app.service(`${type.toLowerCase()}s`).get(id)

      entry.ownerships.forEach(owner => {
        app.service('emails').create({
          template: 'entry_contact_message',
          to: owner.email,
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
    }
  }

  app.use('/entrycontactmessage', service)

  app.service('entrycontactmessage').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  })
}
