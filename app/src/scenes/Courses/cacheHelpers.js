import { readCache, writeCache } from '../../common/apolloCacheHelpers'
import { addItemToList, updateItemInList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_COURSES } from '../../common/requests/courses'

export const syncCacheOnCreate = (cache, item, query) => {
  // Read Cache Query
  const { listCourses } = readCache(cache, LIST_COURSES)
  // If list is not in cache yet then we don't do anything
  if (!listCourses) return
  // Add new item to list
  const newList = addItemToList(listCourses.data, item)
  // Update Cache Query
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_COURSES, { listCourses: { ...listToCache } })
  return listToCache
}

export const syncCacheOnUpdate = (cache, item, query) => {
  // Read Cache
  const { listCourses } = readCache(cache, LIST_COURSES)
  // If list is not in cache yet then we don't do anything
  if (!listCourses) return
  // Update item in list
  const newList = updateItemInList(listCourses.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_COURSES, { listCourses: { ...listToCache } })
  return listToCache
}

export const syncCacheOnDelete = (cache, item, query) => {
  // Read Cache
  const { listCourses } = readCache(cache, LIST_COURSES)
  // If list is not in cache yet then we don't do anything
  if (!listCourses) return
  // Remove item from list
  const newList = removeItemFromList(listCourses.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_COURSES, { listCourses: { ...listToCache } })
  return listToCache
}
