import React, { useReducer } from 'react'
import { AuthContext } from '../contexts'
import { Account } from '../utils'
import { ACCOUNT_ACTION_TYPES } from '../common/constants'

const { getCurrentUser, setCurrentUser, getCurrentToken, setCurrentToken, clearSessionInfo } = Account()

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      setCurrentUser(action.payload.user)
      setCurrentToken(action.payload.token)
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token
      }
    case 'LOGOUT':
      clearSessionInfo()
      return {
        ...state,
        isAuthenticated: false,
        user: null
      }
    default:
      return state
  }
}

const AuthContextProvider = (props) => {
  const currentState = getCurrentUser() && getCurrentToken()
    ? { isAuthenticated: true, user: getCurrentUser(), token: getCurrentToken() }
    : { initialState }

  const [state, dispatch] = useReducer(reducer, currentState)

  const AuthContextStore = { state, dispatch }

  React.useEffect(() => {
    const user = getCurrentUser()
    const token = getCurrentToken()

    if (user && token) {
      dispatch({
        type: ACCOUNT_ACTION_TYPES.LOGIN,
        payload: { user, token }
      })
    }
  }, [])

  return (
    <AuthContext.Provider value={AuthContextStore}>
      {props.children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
