import _ from 'lodash'

const getInfo = res => ({
  type: 'numbered',
  // need to return strings here, otherwise page 0 will evaluate to false
  allPages: _.range(0, res.filteredTotal, res.limit).map(i => i.toString()),
  currentPage: res.skip / res.limit + 1,
  resultsTotal: res.total,
  filteredTotal: res.filteredTotal
})

export default function numberedPagination(next) {
  return {
    read: req =>
      next.read(req).then(res => {
        const paginationDescriptor = getInfo(res.data)
        res.data = res.data.data
        res.data.pagination = paginationDescriptor
        return res
      })
  }
}
