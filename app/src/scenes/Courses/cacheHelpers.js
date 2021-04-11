import { readCacheList, writeCacheList } from '../../common/apolloCacheHelpers'
import { addItemToList, updateItemInList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_COURSES } from './requests'

export const syncCacheOnCreate = (cache, item, query) => {
  // Read Cache Query
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })
  // If list is not in cache yet then we don't do anything
  if (!listCourses) return
  // Add new item to list
  const newList = addItemToList(listCourses.data, item)
  // Update Cache Query
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCacheList(cache, LIST_COURSES, { listCourses: { ...listToCache } })
  return listToCache
}

export const syncCacheOnUpdate = (cache, item, query) => {
  // Read Cache
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })
  // If list is not in cache yet then we don't do anything
  if (!listCourses) return
  // Update item in list
  const newList = updateItemInList(listCourses.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCacheList(cache, LIST_COURSES, { listCourses: { ...listToCache } })
  return listToCache
}

export const syncCacheOnDelete = (cache, item, query) => {
  // Read Cache
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })
  // If list is not in cache yet then we don't do anything
  if (!listCourses) return
  // Remove item from list
  const newList = removeItemFromList(listCourses.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCacheList(cache, LIST_COURSES, { listCourses: { ...listToCache } })
  return listToCache
}
