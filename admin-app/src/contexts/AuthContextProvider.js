import React, { useReducer } from 'react'
import { AuthContext } from '../contexts'
import { Cognito} from '../utils'
import { useCookies } from 'react-cookie'
import { ACCOUNT_ACTION_TYPES, COOKIE_EXPIRATION } from '../common/constants'

const cognito = new Cognito()

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null
}

const AuthContextProvider = (props) => {
  const [cookies, setCookie, removeCookie] = useCookies([])
  const currentState = cookies.user && cookies.token
    ? { isAuthenticated: true, user: cookies.user, token: cookies.token }
    : { initialState }
  const reducer = (state, action) => {
    switch (action.type) {
      case 'LOGIN':

        setCookie('user', action.payload.user, { path: '/', maxAge: COOKIE_EXPIRATION.AN_HOUR })
        setCookie('token', action.payload.token, { path: '/', maxAge: COOKIE_EXPIRATION.AN_HOUR })
        return {
          ...state,
          isAuthenticated: true,
          user: action.payload.user,
          token: action.payload.token
        }
      case 'LOGOUT':
        removeCookie('user', null)
        removeCookie('token', null)
        return {
          ...state,
          isAuthenticated: false,
          user: null
        }
      default:
        return state
    }
  }
  const [state, dispatch] = useReducer(reducer, currentState)

  const AuthContextStore = { state, dispatch, cognito }

  React.useEffect(() => {
    const user = cookies.user
    const token = cookies.token

    if (user && token) {
      dispatch({
        type: ACCOUNT_ACTION_TYPES.LOGIN,
        payload: { user, token }
      })
    }
  }, [cookies.user, cookies.token])

  return (
    <AuthContext.Provider value={AuthContextStore}>
      {props.children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
