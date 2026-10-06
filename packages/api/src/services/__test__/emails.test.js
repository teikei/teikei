import nodemailer from 'nodemailer'
import emails from '../emails.js'

vi.mock('email-templates', () => ({
  default: class {}
}))

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn((config) => config)
  }
}))

describe('email transport configuration', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('uses the JSON sink for test mode without SMTP credentials', () => {
    process.env.NODE_ENV = 'test'
    const mailerConfig = { transport: 'jsonTransport' }
    const app = {
      get: () => mailerConfig,
      isProduction: () => false,
      use: () => {},
      service: () => ({ hooks: () => {} })
    }

    emails(app)

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      jsonTransport: true
    })
  })
})
