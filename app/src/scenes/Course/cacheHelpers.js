import { readCacheList, writeCacheList } from '../../common/apolloCacheHelpers'
import { LIST_COURSES } from './requests'

export const syncCacheOnCreate = (cache, course) => {
  // Read Cache Query
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })

  // If listCourses not in cache then don't do anything
  if (!listCourses) return

  // If listCourses is in cache then we can update it
  const newListCourses = listCourses.data
  newListCourses.push(course)
  const coursesData = {
    data: [...newListCourses], count: newListCourses.length, __typename: listCourses.__typename
  }

  // Update Cache Query
  writeCacheList(cache, LIST_COURSES, { listCourses: { ...coursesData } })

  return coursesData
}

export const syncCacheOnUpdate = (cache, course) => {
  // Read Cache
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })

  // If listCourses not in cache then don't do anything
  if (!listCourses) return

  // If listCourses is in cache then we can update it
  const newListCourses = listCourses.data.filter(c => c.id !== course.id)
  newListCourses.push(course)
  const coursesData = {
    data: [...newListCourses], count: newListCourses.length, __typename: listCourses.__typename
  }

  // Update Cache
  writeCacheList(cache, LIST_COURSES, { listCourses: { ...coursesData } })

  return coursesData
}

export const syncCacheOnDelete = (cache, course) => {
  // Read Cache
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })

  // If listCourses not in cache then don't do anything
  if (!listCourses) return

  // If listCourses is in cache then we can update it
  const newListCourses = listCourses.data.filter(c => c.id !== course.id)
  const coursesData = {
    data: [...newListCourses], count: newListCourses.length, __typename: listCourses.__typename
  }

  // Update Cache
  writeCacheList(cache, LIST_COURSES, { listCourses: { ...coursesData } })

  return coursesData
}
