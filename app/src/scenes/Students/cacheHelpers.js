import { readCache, writeCache } from '../../common/apolloCacheHelpers'
import { addItemToList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_ASSIGNED_EXAMS } from '../../common/requests/assignedExams'

export const syncCacheOnCreate = (cache, item, variables) => {
  // Read Cache Query
  const { listAssignedExams } = readCache(cache, LIST_ASSIGNED_EXAMS, variables)
  // If list is not in cache yet then we don't do anything
  if (!listAssignedExams) return
  // Add new item to list
  const newList = addItemToList(listAssignedExams.data, item)
  // Update Cache Query
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_ASSIGNED_EXAMS, { listAssignedExams: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnDelete = (cache, item, variables) => {
  // Read Cache
  const { listAssignedExams } = readCache(cache, LIST_ASSIGNED_EXAMS, variables)
  // If list is not in cache yet then we don't do anything
  if (!listAssignedExams) return
  // Remove item from list
  const newList = removeItemFromList(listAssignedExams.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_ASSIGNED_EXAMS, { listAssignedExams: { ...listToCache } }, variables)
  return listToCache
}
