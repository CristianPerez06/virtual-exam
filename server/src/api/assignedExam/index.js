require('graphql-import-node/register')

const assignedExamDefs = require('./typeDefs.gql')
const { resolver: assignedExamResolvers } = require('./resolver')

module.exports = {
  assignedExamDefs,
  assignedExamResolvers
}
