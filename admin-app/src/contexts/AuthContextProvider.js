import React, { useReducer } from 'react'
import { AuthContext } from '../contexts'
import { LocalStorageHelper, CognitoHelper } from '../utils'
import { ACCOUNT_ACTION_TYPES } from '../common/constants'

const localStorageHelper = new LocalStorageHelper()
const cognitoHelper = new CognitoHelper()

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      localStorageHelper.setCurrentUser(action.payload.user)
      localStorageHelper.setCurrentToken(action.payload.token)
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token
      }
    case 'LOGOUT':
      localStorageHelper.clearSessionInfo()
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
  const currentState = localStorageHelper.getCurrentUser() && localStorageHelper.getCurrentToken()
    ? { isAuthenticated: true, user: localStorageHelper.getCurrentUser(), token: localStorageHelper.getCurrentToken() }
    : { initialState }

  const [state, dispatch] = useReducer(reducer, currentState)

  const AuthContextStore = { state, dispatch, cognitoHelper, localStorageHelper }

  React.useEffect(() => {
    const user = localStorageHelper.getCurrentUser()
    const token = localStorageHelper.getCurrentToken()

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
