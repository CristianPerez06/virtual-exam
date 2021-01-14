const debug = require('debug')('virtual-exam:prepResults')

const prepSingleResultForUser = (data) => {
  const { _id, ...rest } = data
  const singleResult = {
    id: _id,
    ...rest
  }

  debug('prepSingleResultForUser: ', singleResult)
  return singleResult
}

const prepMultipleResultsForUser = (data) => {
  const multipleResults = data.map(item => {
    return prepSingleResultForUser(item)
  })

  debug('prepMultipleResultsForUser: ', multipleResults)
  return multipleResults
}

module.exports = {
  prepSingleResultForUser,
  prepMultipleResultsForUser
}
