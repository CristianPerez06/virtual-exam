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

module.exports = {
  prepSingleResultForUser
}
