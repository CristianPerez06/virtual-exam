import { readCache, writeCache } from '../../common/apolloCacheHelpers'
import { addItemToList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_ASSIGNED_EXAMS } from '../../common/requests/assignedExams'
import { LIST_EXAMS } from '../../common/requests/exams'

export const syncCacheOnCreate = (cache, item, variables) => {
  // Read Cache Query
  const { listExams } = readCache(cache, LIST_EXAMS, variables)
  // If list is not in cache yet then we don't do anything
  if (!listExams) return
  // Add new item to list
  const newList = addItemToList(listExams.data, item)
  // Update Cache Query
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXAMS, { listExams: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnDeleteAssignedExam = (cache, item, variables) => {
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
