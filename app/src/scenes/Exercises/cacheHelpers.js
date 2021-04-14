import { readCacheList, writeCacheList } from '../../common/apolloCacheHelpers'
import { addItemToList, updateItemInList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_EXERCISES } from '../../common/requests/exercises'

export const syncCacheOnCreate = (cache, item, query) => {
  // Read Cache Query
  const { listExercises } = readCacheList(cache, LIST_EXERCISES)
  // If list is not in cache yet then we don't do anything
  if (!listExercises) return
  // Add new item to list
  const newList = addItemToList(listExercises.data, item)
  // Update Cache Query
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCacheList(cache, LIST_EXERCISES, { listExercises: { ...listToCache } })
  return listToCache
}

export const syncCacheOnUpdate = (cache, item, query) => {
  // Read Cache
  const { listExercises } = readCacheList(cache, LIST_EXERCISES)
  // If list is not in cache yet then we don't do anything
  if (!listExercises) return
  // Update item in list
  const newList = updateItemInList(listExercises.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCacheList(cache, LIST_EXERCISES, { listExercises: { ...listToCache } })
  return listToCache
}

export const syncCacheOnDelete = (cache, item, query) => {
  // Read Cache
  const { listExercises } = readCacheList(cache, LIST_EXERCISES)
  // If list is not in cache yet then we don't do anything
  if (!listExercises) return
  // Remove item from list
  const newList = removeItemFromList(listExercises.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCacheList(cache, LIST_EXERCISES, { listExercises: { ...listToCache } })
  return listToCache
}
