require('graphql-import-node/register')

const unitDefs = require('./typeDefs.gql')
const { resolver: unitResolvers } = require('./resolver')

module.exports = {
  unitDefs,
  unitResolvers
}
