import type { FeathersError } from '@feathersjs/errors'
import type { HookContext, NextFunction } from '@feathersjs/feathers'
import { logger } from '../logger.ts'

export const logError = async (context: HookContext, next: NextFunction) => {
  try {
    await next()
  } catch (error) {
    const { stack, data } = error as FeathersError
    logger.error(stack)
    // Log validation errors
    if (data) {
      logger.error('Data: %O', data)
    }

    throw error
  }
}
