import { readCacheList, writeCacheList } from '../../common/apolloCacheHelpers'
import { addItemToList, updateItemInList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_COURSES } from './requests'

export const syncCacheOnCreate = (cache, item, query) => {
  // Read Cache Query
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })
  // Add new item to list
  const listData = addItemToList(listCourses.data, item)
  // Update Cache Query
  writeCacheList(cache, LIST_COURSES, { listCourses: { ...listData } })
  return listData
}

export const syncCacheOnUpdate = (cache, item, query) => {
  // Read Cache
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })
  // Update item in list
  const listData = updateItemInList([...listCourses.data], item)
  // Update Cache
  writeCacheList(cache, LIST_COURSES, { listCourses: { ...listData } })
  return listData
}

export const syncCacheOnDelete = (cache, item, query) => {
  // Read Cache
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })
  // Remove item from list
  const listData = removeItemFromList(listCourses.data, item)
  // Update Cache
  writeCacheList(cache, LIST_COURSES, { listCourses: { ...listData } })
  return listData
}
