require('graphql-import-node/register')

const metricDefs = require('./typeDefs.gql')
const { resolver: metricResolvers } = require('./resolver')

module.exports = {
  metricDefs,
  metricResolvers
}
