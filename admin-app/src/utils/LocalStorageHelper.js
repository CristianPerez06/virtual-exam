class LocalStorage {
  getCurrentUser () {
    return JSON.parse(localStorage.getItem('user') || null)
  }

  getCurrentToken () {
    return JSON.parse(localStorage.getItem('token') || null)
  }

  setCurrentUser (user) {
    localStorage.setItem('user', JSON.stringify(user))
  }

  setCurrentToken (token) {
    localStorage.setItem('token', JSON.stringify(token))
  }

  clearSessionInfo () {
    localStorage.setItem('user', JSON.stringify(null))
    localStorage.setItem('token', JSON.stringify(null))
    localStorage.clear()
  }
}

export default LocalStorage
