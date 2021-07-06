const { getExamMetrics } = require('./aggregates')

const debug = require('debug')('virtual-exam:metrics-resolver')

const resolver = {
  Query: {
    getExamMetrics: async (parent, args, context) => {
      debug('Running getMetrics query with params:', args)

      // Params
      const { dateFrom, dateTo } = args

      // Collection
      const collection = context.db.collection('exams')

      // Aggregate
      const aggregate = getExamMetrics(dateFrom, dateTo)
      debug('Aggregate: ', aggregate)

      // Exec
      const res = await collection.aggregate(aggregate).toArray()

      // Results
      const result = {
        data: res,
        count: res.length
      }

      return result
    }
  }
}

module.exports = {
  resolver
}
