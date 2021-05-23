import { readCache, writeCache } from '../../common/apolloCacheHelpers'
import { addItemToList, updateItemInList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_UNITS } from '../../common/requests/units'

export const syncCacheOnCreate = (cache, item, variables) => {
  // Read Cache Query
  const { listUnits } = readCache(cache, LIST_UNITS, variables)
  // If list is not in cache yet then we don't do anything
  if (!listUnits) return
  // Add new item to list
  const newList = addItemToList(listUnits.data, item)
  // Update Cache Query
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_UNITS, { listUnits: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnUpdate = (cache, item, variables) => {
  // Read Cache
  const { listUnits } = readCache(cache, LIST_UNITS, variables)
  // If list is not in cache yet then we don't do anything
  if (!listUnits) return
  // Update item in list
  const newList = updateItemInList(listUnits.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_UNITS, { listUnits: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnDelete = (cache, item, variables) => {
  // Read Cache
  const { listUnits } = readCache(cache, LIST_UNITS, variables)
  // If list is not in cache yet then we don't do anything
  if (!listUnits) return
  // Remove item from list
  const newList = removeItemFromList(listUnits.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_UNITS, { listUnits: { ...listToCache } }, variables)
  return listToCache
}
