/* eslint-disable */
import toPath from 'lodash/toPath'
import get from 'lodash/get'

export function continuousPagination(res) {
  let nextPage
  let resultsTotal
  let filteredTotal
  if (res.data.page < res.data.pages) {
    nextPage = res.data.page + 1
  }
  if (res.data.counter) {
    resultsTotal = res.data.counter
  }
  if (res.data.total) {
    filteredTotal = res.data.total
  }
  // Return the pagination descriptor
  return {
    type: 'continuous',
    resultsTotal,
    filteredTotal,
    next: nextPage ? { page: nextPage } : undefined
  }
}

export function urlQuery(req) {
  return Object.assign({}, req.filters, req.page && { page: req.page }, {
    ordering: req.sorting
      .map(field => {
        const prefix = field.sorted == 'ascending' ? '' : '-'
        return prefix + field.sortKey
      })
      .join(',')
  })
}

export function join(p1, p2, var1, var2) {
  return Promise.all([p1, p2]).then(responses =>
    responses[0].set(
      'data',
      responses[0].data.map(item => {
        item[var1] = responses[1].data.find(obj => obj[var2] == item[var1])
        return item
      })
    )
  )
}

/**
 * Works like lodash.get() with an extra feature: '[*]' selects
 * the complete array. For example:
 *
 *      let object = { name: 'Abc', tags: [ {id: 1, name: 'javascript'}, {id: 2, name: 'select'} ]}
 *      let names = select(object, 'tags[*].name')
 *      console.log(names)
 *      > ['javascript', 'select']
 *
 */
export function select(pathSpec, defaultValue) {
  const _select = (data, pathSpec, defaultValue) => {
    if (!data || !pathSpec) {
      return defaultValue
    }
    const path = toPath(pathSpec)
    const pos = path.indexOf('*')
    if (pos >= 0) {
      // Break the path at '*' and do select() recursively on
      // every element of the first path part
      return get(data, path.slice(0, pos)).map(item =>
        _select(item, path.slice(pos + 1), defaultValue)
      )
    }
    return get(data, path, defaultValue)
  }
  return data => _select(data, pathSpec, defaultValue)
}
