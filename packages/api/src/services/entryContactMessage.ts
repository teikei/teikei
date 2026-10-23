import { BadRequest } from '@feathersjs/errors'
import type { Application } from '@feathersjs/feathers'
import type { Feature } from 'geojson'
import { mapDatabaseErrors } from '../db/errors.ts'
import { createDepotsDomain } from '../domain/depots.ts'
import { createFarmsDomain } from '../domain/farms.ts'
import { createInitiativesDomain } from '../domain/initiatives.ts'
import { permalink } from '../hooks/email.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.ts'
import { parseGeoJSON } from '../hooks/geoJson.ts'
import { logger } from '../logger.ts'
import { toDepot, toFarm, toInitiative } from './serializers.ts'

const entryTypes = new Map([
  ['farm', [createFarmsDomain, toFarm]],
  ['depot', [createDepotsDomain, toDepot]],
  ['initiative', [createInitiativesDomain, toInitiative]]
])

type ContactMessage = {
  id?: string
  type?: string
  senderName?: string
  senderEmail?: string
  text?: string
}

// The owner fields this service reads.
type Owner = {
  id: string
  email: string
  locale: string
  origin: string
  baseurl: string
}

export default (app: Application) => {
  const service = {
    create: async (data: ContactMessage) => {
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
      // A single entry parses to a Feature.
      const entry = parseGeoJSON(
        serialize(
          await createDomain(app.get('kysely')).getWithOwners(String(id))
        )
      ) as Feature<{ type: string; id: string; ownerships: Owner[] }>

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
