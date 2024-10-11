import { reAuthenticateUser } from './users.api.ts'

export const reAuthenticateUserQuery = () => ({
  queryKey: ['authenticate'],
  queryFn: async () => {
    try {
      return await reAuthenticateUser()
    } catch (e) {
      return { user: null }
    }
  }
})
