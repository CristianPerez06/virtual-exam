function addItemToList (list, item) {
  (list || []).push(item)
  return list
}

function updateItemInList (list, item) {
  if (!list) return
  const filteredList = list.filter(x => x.toString() !== item.toString())
  filteredList.push(item)
  return filteredList
}

function removeItemFromList (list, item) {
  if (!list) return
  const filteredList = list.filter(x => x.toString() !== item.toString())
  return filteredList
}

module.exports = {
  addItemToList,
  updateItemInList,
  removeItemFromList
}
