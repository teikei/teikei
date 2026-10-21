import { BadRequest } from '@feathersjs/errors'
import { disallow } from 'feathers-hooks-common'
import { mapDatabaseErrors } from '../db/errors.ts'
import { createUsersDomain } from '../domain/users.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import { errorCodes, withErrorCode } from '../utils/errorCodes.js'

const MESSAGES = {
  active: 'User is active, no login state reset required.',
  reset: 'User login recorded, state has been reset.'
}

export default (app) => {
  const users = createUsersDomain(app.get('kysely'))
  const service = {
    create: async (params) => {
      const { id, token } = params
      if (id === undefined || token === undefined) {
        throw new BadRequest(
          'id and token must be present for user login reset.'
        )
      }
      try {
        return MESSAGES[await users.reactivate(String(id), token)]
      } catch (error) {
        // The only BadRequest reactivate throws is for a wrong token.
        throw error instanceof BadRequest
          ? withErrorCode(error, errorCodes.REACTIVATION_TOKEN_INVALID)
          : error
      }
    }
  }
  app.use('/user-reactivation', service)

  app.service('/user-reactivation').hooks({
    before: {
      find: [disallow()],
      get: [disallow()],
      update: [disallow()],
      patch: [disallow()],
      remove: [disallow()]
    },
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields],
      create: [filterAllowedFields],
      patch: [filterAllowedFields],
      remove: [filterAllowedFields]
    },
    error: { all: [mapDatabaseErrors] }
  })
}
