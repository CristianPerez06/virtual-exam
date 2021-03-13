import React, { useReducer } from 'react'
import { AuthContext } from '../contexts'
import { Cognito } from '../utils'
import Cookies from 'js-cookie'
import { ACCOUNT_ACTION_TYPES, COOKIE_NAMES } from '../common/constants'

const cognito = new Cognito()

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null
}

const AuthContextProvider = (props) => {
  // Expiration set to 60 minutes
  const cookieExpiration = new Date(
    new Date().getTime() +
      60 * // Minutes
      60 * // Seconds
      1000 // Milliseconds
  )

  const reducer = (state, action) => {
    switch (action.type) {
      case ACCOUNT_ACTION_TYPES.LOGIN:
      case ACCOUNT_ACTION_TYPES.REFRESH:
        Cookies.set(COOKIE_NAMES.USER, action.payload.user, { expires: cookieExpiration })
        Cookies.set(COOKIE_NAMES.TOKEN, action.payload.token, { expires: cookieExpiration })
        return {
          ...state,
          isAuthenticated: true,
          user: action.payload.user
        }
      case ACCOUNT_ACTION_TYPES.LOGOUT:
        Cookies.remove(COOKIE_NAMES.USER)
        Cookies.remove(COOKIE_NAMES.TOKEN)
        return {
          ...state,
          isAuthenticated: false,
          user: null
        }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const AuthContextStore = { state, dispatch, cognito }

  return (
    <AuthContext.Provider value={AuthContextStore}>
      {props.children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
