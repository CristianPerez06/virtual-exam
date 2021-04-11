export const addItemToList = (list, item) => {
  list.push(item)
  return list
}

export const updateItemInList = (list, item) => {
  if (!list) return
  const filteredList = list.filter(c => c.id !== item.id)
  filteredList.push(item)
  return filteredList
}

export const removeItemFromList = (list, item) => {
  if (!list) return
  const filteredList = list.filter(c => c.id !== item.id)
  return filteredList
}
