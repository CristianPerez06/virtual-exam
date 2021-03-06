import { readCache, writeCache } from '../../common/apolloCacheHelpers'
import { addItemToList, updateItemInList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_ANSWERS } from '../../common/requests/answers'
import { LIST_EXERCISES } from '../../common/requests/exercises'

export const syncCacheOnCreate = (cache, item, variables) => {
  // Read Cache Query
  const { listExercises } = readCache(cache, LIST_EXERCISES, variables)
  // If list is not in cache yet then we don't do anything
  if (!listExercises) return
  // Add new item to list
  const newList = addItemToList(listExercises.data, item)
  // Update Cache Query
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXERCISES, { listExercises: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnUpdate = (cache, item, variables) => {
  // Read Cache
  const { listExercises } = readCache(cache, LIST_EXERCISES, variables)
  // If list is not in cache yet then we don't do anything
  if (!listExercises) return
  // Update item in list
  const newList = updateItemInList(listExercises.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXERCISES, { listExercises: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnDelete = (cache, item, variables) => {
  // Read Cache
  const { listExercises } = readCache(cache, LIST_EXERCISES, variables)
  // If list is not in cache yet then we don't do anything
  if (!listExercises) return
  // Remove item from list
  const newList = removeItemFromList(listExercises.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXERCISES, { listExercises: { ...listToCache } }, variables)
  return listToCache
}

export const syncAnswersCacheOnCreate = (cache, item, variables) => {
  // Read Cache Query
  const { listAnswers } = readCache(cache, LIST_ANSWERS, variables)
  // If list is not in cache yet then we don't do anything
  if (!listAnswers) return
  // Add new item to list
  const newList = addItemToList(listAnswers.data, item)
  // Update Cache Query
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_ANSWERS, { listAnswers: { ...listToCache } }, variables)
  return listToCache
}

export const syncAnswersCacheOnUpdate = (cache, item, variables) => {
  // Read Cache
  const { listAnswers } = readCache(cache, LIST_ANSWERS, variables)
  // If list is not in cache yet then we don't do anything
  if (!listAnswers) return
  // Update item in list
  const newList = updateItemInList(listAnswers.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_ANSWERS, { listAnswers: { ...listToCache } }, variables)
  return listToCache
}

export const syncAnswersCacheOnDelete = (cache, item, variables) => {
  // Read Cache
  const { listAnswers } = readCache(cache, LIST_ANSWERS, variables)
  // If list is not in cache yet then we don't do anything
  if (!listAnswers) return
  // Remove item from list
  const newList = removeItemFromList(listAnswers.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_ANSWERS, { listAnswers: { ...listToCache } }, variables)
  return listToCache
}
