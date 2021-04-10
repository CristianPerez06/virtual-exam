import { readCacheList, writeCacheList } from '../../common/apolloCacheHelpers'
import { addItemToList, updateItemInList, removeItemFromList } from '../../common/arrayHelpers'
import { LIST_UNITS } from './requests'

export const syncCacheOnCreate = (cache, item, query) => {
  // Read Cache Query
  const { listUnits } = readCacheList(cache, LIST_UNITS, { q: '', offset: 0, limit: 100 })
  // Add new item to list
  const listData = addItemToList(listUnits.data, item)
  // Update Cache Query
  writeCacheList(cache, LIST_UNITS, { listUnits: { ...listData } })
  return listData
}

export const syncCacheOnUpdate = (cache, item, query) => {
  // Read Cache
  const { listUnits } = readCacheList(cache, LIST_UNITS, { q: '', offset: 0, limit: 100 })
  // Update item in list
  const listData = updateItemInList(listUnits.data, item)
  // Update Cache
  writeCacheList(cache, LIST_UNITS, { listUnits: { ...listData } })
  return listData
}

export const syncCacheOnDelete = (cache, item, query) => {
  // Read Cache
  const { listUnits } = readCacheList(cache, LIST_UNITS, { q: '', offset: 0, limit: 100 })
  // Remove item from list
  const listData = removeItemFromList(listUnits.data, item)
  // Update Cache
  writeCacheList(cache, LIST_UNITS, { listUnits: { ...listData } })
  return listData
}
