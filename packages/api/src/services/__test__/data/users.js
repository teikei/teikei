import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'

export const newUserData = () => ({
  email: `${uuid()}@teikei.com`,
  name: 'Guest',
  phone: '1234',
  password: 'guest'
})

// Inserts a user with the password 'guest' directly, so tests don't depend on
// the sign-up flow. Roles are role names and admin origins origin URLs, both
// from the seeds. Returns the row, password hash included, as the
// authentication hook puts it into params.user.
export const createTestUser = async (
  db,
  { isVerified = false, roles = ['user'], adminOrigins = [] } = {}
) => {
  const { password, ...data } = newUserData()
  const user = await db
    .insertInto('users')
    .values({
      ...data,
      password: await bcrypt.hash(password, 4),
      isVerified,
      createdAt: new Date()
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  if (roles.length > 0) {
    await db
      .insertInto('usersRoles')
      .columns(['userId', 'roleId'])
      .expression(
        db
          .selectFrom('roles')
          .select((eb) => [eb.val(user.id).as('userId'), 'id'])
          .where('name', 'in', roles)
      )
      .execute()
  }
  if (adminOrigins.length > 0) {
    await db
      .insertInto('adminsOrigins')
      .columns(['userId', 'originId'])
      .expression(
        db
          .selectFrom('origins')
          .select((eb) => [eb.val(user.id).as('userId'), 'id'])
          .where('origin', 'in', adminOrigins)
      )
      .execute()
  }
  return user
}

export const findUser = (db, id) =>
  db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
