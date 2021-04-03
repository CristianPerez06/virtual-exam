import { readCacheList, writeCacheList } from '../../common/apolloCacheHelpers'
import { LIST_COURSES } from './requests'

export const syncCacheOnCreate = (cache, course) => {
  // Read Cache Query
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })

  // If listCourses is not empty it means then we can update the cache
  if (listCourses.count !== 0) {
    const newListCourses = listCourses.data

    // Add new item
    newListCourses.push(course)

    const coursesData = {
      data: [...newListCourses], count: newListCourses.length, __typename: listCourses.__typename
    }
    // Update Cache Query
    writeCacheList(cache, LIST_COURSES, { listCourses: { ...coursesData } })

    return coursesData
  }

  return listCourses
}

export const syncCacheOnUpdate = (cache, course) => {
  // Read Cache
  const { listCourses } = readCacheList(cache, LIST_COURSES, { q: '', offset: 0, limit: 100 })

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

  const newListCourses = listCourses.data.filter(c => c.id !== course.id)
  const coursesData = {
    data: [...newListCourses], count: newListCourses.length, __typename: listCourses.__typename
  }

  // Update Cache
  writeCacheList(cache, LIST_COURSES, { listCourses: { ...coursesData } })

  return coursesData
}
