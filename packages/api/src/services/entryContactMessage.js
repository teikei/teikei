import { BadRequest } from '@feathersjs/errors'
import { mapDatabaseErrors } from '../db/errors.ts'
import { createDepotsDomain } from '../domain/depots.ts'
import { createFarmsDomain } from '../domain/farms.ts'
import { createInitiativesDomain } from '../domain/initiatives.ts'
import { permalink } from '../hooks/email.js'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import { parseGeoJSON } from '../hooks/geoJson.js'
import { logger } from '../logger.js'
import { toDepot, toFarm, toInitiative } from './serializers.ts'

const entryTypes = new Map([
  ['farm', [createFarmsDomain, toFarm]],
  ['depot', [createDepotsDomain, toDepot]],
  ['initiative', [createInitiativesDomain, toInitiative]]
])

export default (app) => {
  const service = {
    create: async (data) => {
      const { id, type, senderName, senderEmail, text } = data

      if (!senderName || !senderEmail || !text) {
        throw new Error(
          'validation failed, please provide senderName, senderEmail and text'
        )
      }

      const entryType = entryTypes.get(String(type).toLowerCase())
      if (!entryType) {
        throw new BadRequest(`Unknown entry type ${type}`)
      }
      const [createDomain, serialize] = entryType
      const entry = parseGeoJSON(
        serialize(
          await createDomain(app.get('kysely')).getWithOwners(String(id))
        )
      )

      entry.properties.ownerships.forEach((owner) => {
        app
          .service('emails')
          .create({
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
          .catch((err) =>
            logger.warn(
              `failed to send entry contact email for entry ${id} to user ${owner.id} (${owner.email}): ${err?.message}`,
              err
            )
          )
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
    },
    error: {
      create: [mapDatabaseErrors]
    }
  })
}
