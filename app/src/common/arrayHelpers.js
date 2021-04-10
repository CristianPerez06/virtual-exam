export const addItemToList = (list, item) => {
  if (!list) return

  list.push(item)
  const listData = {
    data: [...list], count: list.length, __typename: list.__typename
  }

  return listData
}

export const updateItemInList = (list, item) => {
  if (!list) return

  const filteredList = list.filter(c => c.id !== item.id)
  filteredList.push(item)
  const listData = {
    data: [...filteredList], count: filteredList.length, __typename: list.__typename
  }

  return listData
}

export const removeItemFromList = (list, item) => {
  if (!list) return

  const filteredList = list.filter(c => c.id !== item.id)
  const listData = {
    data: [...filteredList], count: filteredList.length, __typename: list.__typename
  }

  return listData
}
