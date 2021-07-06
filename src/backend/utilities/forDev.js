// Usefull tools just for development

// Call this function whenever you want to delay an execution
function delay (t, val) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(val)
    }, t)
  })
}

module.exports = {
  delay
}
