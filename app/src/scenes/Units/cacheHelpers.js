import { readCacheList, writeCacheList } from '../../common/apolloCacheHelpers'
import { LIST_UNITS } from './requests'

export const syncCacheOnCreate = (cache, unit) => {
  // Read Cache Query
  const { listUnits } = readCacheList(cache, LIST_UNITS, { q: '', offset: 0, limit: 100 })

  // If listUnits not in cache then don't do anything
  if (!listUnits) return

  // If listUnits is in cache then we can update it
  const newListUnits = listUnits.data
  newListUnits.push(unit)
  const unitsData = {
    data: [...newListUnits], count: newListUnits.length, __typename: listUnits.__typename
  }

  // Update Cache Query
  writeCacheList(cache, LIST_UNITS, { listUnits: { ...unitsData } })

  return unitsData
}

export const syncCacheOnUpdate = (cache, unit) => {
  // Read Cache
  const { listUnits } = readCacheList(cache, LIST_UNITS, { q: '', offset: 0, limit: 100 })

  // If listUnits not in cache then don't do anything
  if (!listUnits) return

  // If listUnits is in cache then we can update it
  const newListUnits = listUnits.data.filter(c => c.id !== unit.id)
  newListUnits.push(unit)
  const unitsData = {
    data: [...newListUnits], count: newListUnits.length, __typename: newListUnits.__typename
  }

  // Update Cache
  writeCacheList(cache, LIST_UNITS, { listUnits: { ...unitsData } })

  return unitsData
}

export const syncCacheOnDelete = (cache, unit) => {
  // Read Cache
  const { listUnits } = readCacheList(cache, LIST_UNITS, { q: '', offset: 0, limit: 100 })

  // If listUnits not in cache then don't do anything
  if (!listUnits) return

  // If listUnits is in cache then we can update it
  const newListUnits = listUnits.data.filter(c => c.id !== unit.id)
  const unitsData = {
    data: [...newListUnits], count: newListUnits.length, __typename: listUnits.__typename
  }

  // Update Cache
  writeCacheList(cache, LIST_UNITS, { listUnits: { ...unitsData } })

  return unitsData
}
