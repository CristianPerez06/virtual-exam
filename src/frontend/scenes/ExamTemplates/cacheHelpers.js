import { readCache, writeCache } from '../../common/apolloCacheHelpers'
import { addItemToList, updateItemInList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_EXAM_TEMPLATES, LIST_EXAM_TEMPLATE_EXERCISES } from '../../common/requests/templates'

export const syncCacheOnCreate = (cache, item, variables) => {
  // Read Cache Query
  const { listExamTemplates } = readCache(cache, LIST_EXAM_TEMPLATES, variables)
  // If list is not in cache yet then we don't do anything
  if (!listExamTemplates) return
  // Add new item to list
  const newList = addItemToList(listExamTemplates.data, item)
  // Update Cache Query
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXAM_TEMPLATES, { listExamTemplates: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnUpdate = (cache, item) => {
  // Read Cache
  const { listExamTemplates } = readCache(cache, LIST_EXAM_TEMPLATES)
  // If list is not in cache yet then we don't do anything
  if (!listExamTemplates) return
  // Update item in list
  const newList = updateItemInList(listExamTemplates.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXAM_TEMPLATES, { listExamTemplates: { ...listToCache } })
  return listToCache
}

export const syncCacheOnDelete = (cache, item, variables) => {
  // Read Cache
  const { listExamTemplates } = readCache(cache, LIST_EXAM_TEMPLATES, variables)
  // If list is not in cache yet then we don't do anything
  if (!listExamTemplates) return
  // Remove item from list
  const newList = removeItemFromList(listExamTemplates.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXAM_TEMPLATES, { listExamTemplates: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnAddTemplateExercise = (cache, item, variables) => {
  // Read Cache
  const { listExamTemplateExercises } = readCache(cache, LIST_EXAM_TEMPLATE_EXERCISES, variables)
  // If list is not in cache yet then we don't do anything
  if (!listExamTemplateExercises) return
  // Remove item from list
  const newList = addItemToList(listExamTemplateExercises.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXAM_TEMPLATE_EXERCISES, { listExamTemplateExercises: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnUpdateTemplateExercise = (cache, item, variables) => {
  // Read Cache
  const { listExamTemplateExercises } = readCache(cache, LIST_EXAM_TEMPLATE_EXERCISES, variables)
  // If list is not in cache yet then we don't do anything
  if (!listExamTemplateExercises) return
  // Remove item from list
  const newList = updateItemInList(listExamTemplateExercises.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXAM_TEMPLATE_EXERCISES, { listExamTemplateExercises: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnRemoveTemplateExercise = (cache, item, variables) => {
  // Read Cache
  const { listExamTemplateExercises } = readCache(cache, LIST_EXAM_TEMPLATE_EXERCISES, variables)
  // If list is not in cache yet then we don't do anything
  if (!listExamTemplateExercises) return
  // Update item in list
  const newList = removeItemFromList(listExamTemplateExercises.data, item)
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXAM_TEMPLATE_EXERCISES, { listExamTemplateExercises: { ...listToCache } }, variables)
  return listToCache
}

export const syncCacheOnResetTemplateExercises = (cache, item, variables) => {
  // Reset items list
  const newList = []
  // Update Cache
  const listToCache = {
    data: [...newList], count: newList.length, __typename: item.__typename
  }
  writeCache(cache, LIST_EXAM_TEMPLATE_EXERCISES, { listExamTemplateExercises: { ...listToCache } }, variables)
  return listToCache
}
