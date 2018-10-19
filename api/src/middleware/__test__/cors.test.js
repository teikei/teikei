import { parseCorsOrigins } from '../cors'

describe('cors', () => {
  it('parses string origins', () => {
    const parsedOrigins = parseCorsOrigins('example.com,something.com')
    expect(parsedOrigins).toEqual(['example.com', 'something.com'])
  })

  it('parses regex origins', () => {
    const parsedOrigins = parseCorsOrigins('/.*\\.something.com/,/(www)?\\.something.com/')
    expect(parsedOrigins).toEqual([/.*\.something.com/, /(www)?\.something.com/])
  })

  it('parses string and regex origins', () => {
    const parsedOrigins = parseCorsOrigins('example.com,/.*\\.something.com/')
    expect(parsedOrigins).toEqual(['example.com', /.*\.something.com/])
  })

  it('parses an empty configuration', () => {
    const parsedOrigins = parseCorsOrigins('')
    expect(parsedOrigins).toEqual([''])
  })

  it('removes whitespace from the configuration', () => {
    const parsedOrigins = parseCorsOrigins('example.com ,   something.com')
    expect(parsedOrigins).toEqual(['example.com', 'something.com'])
  })
})
