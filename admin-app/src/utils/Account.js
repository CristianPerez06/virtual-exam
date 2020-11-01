const Account = () => {
  const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user') || null)
  }

  const getCurrentToken = () => {
    return JSON.parse(localStorage.getItem('token') || null)
  }

  const setCurrentUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user))
  }

  const setCurrentToken = (token) => {
    localStorage.setItem('token', JSON.stringify(token))
  }

  const clearSessionInfo = () => {
    localStorage.setItem('user', JSON.stringify(null))
    localStorage.setItem('token', JSON.stringify(null))
    localStorage.clear()
  }

  return {
    getCurrentUser,
    getCurrentToken,
    setCurrentUser,
    setCurrentToken,
    clearSessionInfo
  }
}
export default Account
