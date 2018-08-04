function getInfo(res) {
  // total number of results
  const resultsTotal = res.counter
  // total number of filtered results
  const filteredTotal = res.total
  // current page
  const currentPage = res.page
  // total pages
  const pagesTotal = res.pages

  // next page as number
  const nextPage = currentPage > pagesTotal ? currentPage + 1 : null
  // previous page as number
  const previousPage = currentPage > 1 ? currentPage - 1 : null
  // the page size
  const pageSize = res.docs.length

  // Compute all page cursors
  const allPages = []
  for (let i = 0; i < pagesTotal; i++) {
    allPages[i] = `${i + 1}` // We return string, so that the page will be preserved in the path query
  }

  return {
    type: 'numbered',
    allPages,
    currentPage,
    resultsTotal,
    filteredTotal
  }
}

export default function numberedPagination(next) {
  return {
    read: req =>
      next.read(req).then(res => {
        const paginationDescriptor = getInfo(res.data)
        res.data = res.data.docs
        res.data.pagination = paginationDescriptor
        return res
      })
  }
}
