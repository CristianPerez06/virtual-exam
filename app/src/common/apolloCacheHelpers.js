export const readCache = (cache, query, variables) => {
  const fromQuery = { query, variables }
  try {
    const result = cache.readQuery(fromQuery)
    return result
  } catch (e) {
    return {}
  }
}

export const writeCache = (cache, query, data, variables) => {
  const toQuery = { query, data, variables }
  cache.writeQuery(toQuery)
}
