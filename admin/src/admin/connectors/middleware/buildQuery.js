import url from 'url'

export default function createBuildQuery() {
  function urlWithQuery(req) {
    if (typeof req.url !== 'string') {
      throw new Error(`Request URL must be a string. Found ${req.url}`)
    }

    const filters = r => r.filters

    const pagination = r => ({ $skip: r.page || 0 })

    const sorting = r => {
      const sortQuery = {}
      if (r.sorting && r.sorting.length > 0) {
        r.sorting.forEach(field => {
          sortQuery[`$sort[${field.sortKey}]`] =
            field.sorted === 'ascending' ? '1' : '-1'
        })
      }
      return sortQuery
    }

    const parsed = url.parse(req.url, true)
    parsed.search = undefined
    parsed.query = Object.assign(
      {},
      parsed.query,
      filters(req),
      sorting(req),
      pagination(req)
    )

    return url.format(parsed)
  }

  return function buildQuery(next) {
    return {
      create: req => {
        req.url = urlWithQuery(req)
        return next.create(req)
      },
      read: req => {
        req.url = urlWithQuery(req)
        return next.read(req)
      },
      update: req => {
        req.url = urlWithQuery(req)
        return next.update(req)
      },
      delete: req => {
        req.url = urlWithQuery(req)
        return next.delete(req)
      }
    }
  }
}