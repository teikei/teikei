import { setNow } from 'feathers-hooks-common'

// TODO why are timestamps stored as UTC when created like this?
export const setCreatedAt = setNow('created_at')

export const setUpdatedAt = setNow('updated_at')
