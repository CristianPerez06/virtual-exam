const debug = require('debug')('virtual-exam:prepResults')

const prepSingleResultForUser = (item) => {
  const { _id, ...rest } = item
  const singleResult = {
    id: _id,
    ...rest
  }

  debug('prepSingleResultForUser: ', singleResult)
  return singleResult
}

const prepMultipleResultsForUser = (items) => {
  const data = items.map(item => {
    return prepSingleResultForUser(item)
  })

  const multipleResults = {
    data: data,
    count: data.length
  }

  debug('prepMultipleResultsForUser: ', multipleResults)
  return multipleResults
}

module.exports = {
  prepSingleResultForUser,
  prepMultipleResultsForUser
}
