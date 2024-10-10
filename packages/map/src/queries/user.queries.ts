import { reAuthenticateUser } from './user.api.ts'

export const authenticateUserQuery = {
  queryKey: ['authenticate'],
  queryFn: async () => {
    try {
      return await reAuthenticateUser()
    } catch (e) {
      return { user: null }
    }
  }
}
