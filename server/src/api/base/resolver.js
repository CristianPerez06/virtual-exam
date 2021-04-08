const resolver = {
  Query: {
    baseQuery: async (parent, args, context) => {
      return { done: true }
    }
  },
  Mutation: {
    baseMutation: async (parent, args, context) => {
      return { done: true }
    }
  }
}

module.exports = {
  resolver
}
