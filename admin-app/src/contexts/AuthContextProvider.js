import React, { useReducer } from 'react'
import { AuthContext } from '../contexts'
import { Cognito } from '../utils'
import { useCookies } from 'react-cookie'
import { ACCOUNT_ACTION_TYPES } from '../common/constants'

const cognito = new Cognito()

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null
}

const AuthContextProvider = (props) => {
  const [cookies, setCookie, removeCookie] = useCookies([]) // eslint-disable-line no-unused-vars
  const reducer = (state, action) => {
    switch (action.type) {
      case ACCOUNT_ACTION_TYPES.LOGIN:
        setCookie('user', action.payload.user, { path: '/' })
        return {
          ...state,
          isAuthenticated: true,
          user: action.payload.user
        }
      case ACCOUNT_ACTION_TYPES.LOGOUT:
        removeCookie('user', null)
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
