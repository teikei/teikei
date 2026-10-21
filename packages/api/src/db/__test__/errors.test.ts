import {
  BadRequest,
  Conflict,
  GeneralError,
  NotFound
} from '@feathersjs/errors'
import type { HookContext } from '@feathersjs/feathers'
import Joi from 'joi'
import { sql } from 'kysely'
import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb
} from '../../../db/integrationTestSetup.js'
import { mapDatabaseErrors, toFeathersError, validate } from '../errors.ts'
import { createKysely, type Database } from '../kysely.ts'

const failureOf = (query: Promise<unknown>) =>
  query.then(
    () => {
      throw new Error('expected the statement to fail')
    },
    (error: unknown) => toFeathersError(error)
  )

describe('database error mapping', () => {
  let db: Database

  beforeAll(async () => {
    await setupIntegrationTestDb()
    db = createKysely({ connection: getTestDbConnectionString })
  })

  afterAll(async () => {
    await db.destroy()
    await truncateTestDb()
  })

  it('maps a unique violation to Conflict with the offending columns', async () => {
    const error = await failureOf(
      db
        .insertInto('products')
        .values({ category: 'vegetable_products', name: 'vegetables' })
        .execute()
    )

    expect(error).toBeInstanceOf(Conflict)
    expect(error.toJSON()).toEqual({
      name: 'Conflict',
      message: 'category, name must be unique',
      code: 409,
      className: 'conflict',
      data: {
        columns: ['category', 'name'],
        table: 'products',
        constraint: 'products_category_name_unique'
      }
    })
  })

  it('maps a not-null violation to BadRequest naming the column', async () => {
    const error = await failureOf(
      sql`insert into goals (id, name) values (null, 'nothing')`.execute(db)
    )

    expect(error).toBeInstanceOf(BadRequest)
    expect(error.toJSON()).toEqual({
      name: 'BadRequest',
      message: 'id must not be null',
      code: 400,
      className: 'bad-request',
      data: { column: 'id', table: 'goals' }
    })
  })

  it('maps a foreign-key violation to Conflict', async () => {
    const error = await failureOf(
      db
        .insertInto('farmsProducts')
        .values({ farmId: 999999, productId: 999999 })
        .execute()
    )

    expect(error).toBeInstanceOf(Conflict)
    expect(error.message).toBe('Foreign Key Violation')
    expect(error.data).toEqual({
      table: 'farms_products',
      constraint: expect.stringMatching(/_foreign$/)
    })
  })

  it('maps a check violation to BadRequest', async () => {
    const error = await failureOf(
      db
        .insertInto('audit')
        .values({ tableName: 'farms', userName: 'test', action: 'x' })
        .execute()
    )

    expect(error).toBeInstanceOf(BadRequest)
    expect(error.message).toBe('Check Violation')
    expect(error.data).toEqual({
      table: 'audit',
      constraint: 'audit_action_check'
    })
  })

  it('maps invalid text input to BadRequest', async () => {
    const error = await failureOf(
      sql`select * from badges where id = ${'abc'}`.execute(db)
    )

    expect(error).toBeInstanceOf(BadRequest)
    expect(error.toJSON()).toEqual({
      name: 'BadRequest',
      message: 'Invalid Data',
      code: 400,
      className: 'bad-request'
    })
  })

  it('maps any other database error to GeneralError', async () => {
    const error = await failureOf(sql`select * from nonexistent`.execute(db))

    expect(error).toBeInstanceOf(GeneralError)
    expect(error.message).toBe('Unknown Database Error')
  })

  it('passes Feathers errors through', () => {
    const notFound = new NotFound('gone')

    expect(toFeathersError(notFound)).toBe(notFound)
  })

  it('maps the error of a service call in the error hook', async () => {
    const ctx = {
      error: await db
        .insertInto('farmsProducts')
        .values({ farmId: 1, productId: 999999 })
        .execute()
        .catch((error: unknown) => error)
    } as HookContext
    mapDatabaseErrors(ctx)
    expect(ctx.error).toBeInstanceOf(Conflict)

    const notFound = new NotFound('gone')
    const passed = { error: notFound } as HookContext
    mapDatabaseErrors(passed)
    expect(passed.error).toBe(notFound)
  })
})

describe('validate', () => {
  const schema = { name: Joi.string().max(5).trim().required() }

  it('returns the validated value', () => {
    expect(validate(schema, { name: ' land ' })).toEqual({ name: 'land' })
  })

  it('throws BadRequest carrying every Joi error detail', () => {
    const run = () => validate(schema, { name: 'far too long', extra: 1 })

    expect(run).toThrow(BadRequest)
    try {
      run()
    } catch (error) {
      expect((error as BadRequest).errors).toEqual([
        expect.objectContaining({ path: ['name'], type: 'string.max' }),
        expect.objectContaining({ path: ['extra'], type: 'object.unknown' })
      ])
    }
  })
})
