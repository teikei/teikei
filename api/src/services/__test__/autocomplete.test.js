import app from '../../app'

describe('autocomplete service', () => {
  const service = app.service('autocomplete')

  it('gets registered', () => {
    expect(service).toBeTruthy()
  })

  it('has no find method', () => {
    expect(service.find).toEqual(undefined)
  })

  it('has no get method', () => {
    expect(service.get).toEqual(undefined)
  })

  it('has no update method', () => {
    expect(service.update).toEqual(undefined)
  })

  it('has no patch method', () => {
    expect(service.patch).toEqual(undefined)
  })

  it('has no remove method', () => {
    expect(service.remove).toEqual(undefined)
  })

  it('creates autocomplete suggestions', () => {
    // TODO extract here maps to component/service and mock it
  })
})
