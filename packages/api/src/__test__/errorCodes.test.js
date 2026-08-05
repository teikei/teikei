import { BadRequest, NotAuthenticated } from '@feathersjs/errors'
import { errorCodes, withErrorCode } from '../utils/errorCodes.js'

describe('withErrorCode', () => {
  it('exposes the code at data.errorCode without touching code or message', () => {
    const error = withErrorCode(
      new NotAuthenticated('Invalid login'),
      errorCodes.INVALID_CREDENTIALS
    )

    expect(error.toJSON()).toEqual({
      name: 'NotAuthenticated',
      message: 'Invalid login',
      code: 401,
      className: 'not-authenticated',
      data: { errorCode: 'INVALID_CREDENTIALS' }
    })
  })

  it('keeps existing data keys', () => {
    const error = withErrorCode(
      new BadRequest('Invalid reactivation token.', { token: 'abc' }),
      errorCodes.REACTIVATION_TOKEN_INVALID
    )

    expect(error.toJSON().data).toEqual({
      token: 'abc',
      errorCode: 'REACTIVATION_TOKEN_INVALID'
    })
  })

  it('leaves an uncoded error serializing unchanged', () => {
    const error = new BadRequest("User's email is not yet verified.")

    expect(error.toJSON()).toEqual({
      name: 'BadRequest',
      message: "User's email is not yet verified.",
      code: 400,
      className: 'bad-request'
    })
    expect(error.toJSON()).not.toHaveProperty('data')
  })
})
