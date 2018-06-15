export default app => {
  const permalink = ({ origin, baseurl }, { type, id }) =>
    `${origin}${baseurl}/${type().toLowerCase()}s/${id}`

  const service = {
    create: async data => {
      const entry = await app
        .service(`${data.type.toLowerCase()}s`)
        .getWithOwnerships(data.id)

      console.log(entry)
      entry.ownerships.forEach(recipient => {
        app.service('emails').create({
          template: 'entry_contact_message',
          to: data.email,
          locals: {
            recipient,
            entry,
            permalink: permalink(recipient, entry),
            message: {
              senderName: data.senderName,
              senderEmail: data.senderEmail,
              text: data.text
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
