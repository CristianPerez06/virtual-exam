require('graphql-import-node/register')

const exerciseDefs = require('./typeDefs.gql')
const { resolver: exerciseResolvers } = require('./resolver')

module.exports = {
  exerciseDefs,
  exerciseResolvers
}
