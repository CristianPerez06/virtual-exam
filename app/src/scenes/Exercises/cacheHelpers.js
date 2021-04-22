import { readCacheList, writeCacheList } from '../../common/apolloCacheHelpers'
import { addItemToList, updateItemInList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_ANSWERS } from '../../common/requests/answers'
import { LIST_EXERCISES } from '../../common/requests/exercises'

export const syncExercisesCacheOnCreate = (cache, item) => {
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

export const syncExercisesCacheOnUpdate = (cache, item) => {
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

export const syncExercisesCacheOnDelete = (cache, item) => {
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

export const syncAnswersCacheOnCreate = (cache, item, query) => {
  // Read Cache Query
  const { listAnswers } = readCacheList(cache, LIST_ANSWERS, query)
  // If list is not in cache yet then we don't do anything
  if (!listAnswers) return
  // Add new item to list
  const newList = addItemToList(listAnswers.data, item)
  // Update Cache Query
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCacheList(cache, LIST_ANSWERS, { listAnswers: { ...listToCache } }, query)
  return listToCache
}

export const syncAnswersCacheOnUpdate = (cache, item, query) => {
  // Read Cache
  const { listAnswers } = readCacheList(cache, LIST_ANSWERS, query)
  // If list is not in cache yet then we don't do anything
  if (!listAnswers) return
  // Update item in list
  const newList = updateItemInList(listAnswers.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCacheList(cache, LIST_ANSWERS, { listAnswers: { ...listToCache } }, query)
  return listToCache
}

export const syncAnswersCacheOnDelete = (cache, item, query) => {
  // Read Cache
  const { listAnswers } = readCacheList(cache, LIST_ANSWERS, query)
  // If list is not in cache yet then we don't do anything
  if (!listAnswers) return
  // Remove item from list
  const newList = removeItemFromList(listAnswers.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCacheList(cache, LIST_ANSWERS, { listAnswers: { ...listToCache } }, query)
  return listToCache
}
