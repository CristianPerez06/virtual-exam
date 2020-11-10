// import React, { createContext, useReducer } from 'react'
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthRouter, UnauthRouter } from './routers'
import { Layout } from './components/layout'
// import { ACCOUNT_ACTION_TYPES } from './common/constants'
// import { Account } from './utils'
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react"

// export const AuthContext = createContext()

// const { getCurrentUser, setCurrentUser, getCurrentToken, setCurrentToken, clearSessionInfo } = Account()

// const initialState = {
//   isAuthenticated: false,
//   user: null,
//   token: null
// }

// const reducer = (state, action) => {
//   switch (action.type) {
//     case 'LOGIN':
//       setCurrentUser(action.payload.user)
//       setCurrentToken(action.payload.token)
//       return {
//         ...state,
//         isAuthenticated: true,
//         user: action.payload.user,
//         token: action.payload.token
//       }
//     case 'LOGOUT':
//       clearSessionInfo()
//       return {
//         ...state,
//         isAuthenticated: false,
//         user: null
//       }
//     default:
//       return state
//   }
// }

const App = () => {
  // const currentState = getCurrentUser() && getCurrentToken()
  //   ? { isAuthenticated: true, user: getCurrentUser(), token: getCurrentToken() }
  //   : { initialState }

  // // hooks
  // const [state, dispatch] = useReducer(reducer, currentState)

  // React.useEffect(() => {
  //   const user = getCurrentUser()
  //   const token = getCurrentToken()

  //   if (user && token) {
  //     dispatch({
  //       type: ACCOUNT_ACTION_TYPES.LOGIN,
  //       payload: { user, token }
  //     })
  //   }
  // }, [])

  // return (
  //   <AuthContext.Provider value={{ state, dispatch }}>
  //     <div className='App w-100 h-100'>
  //       <Router>
  //         {state.isAuthenticated
  //           ? <Layout><AuthRouter /></Layout>
  //           : <UnauthRouter />}
  //       </Router>
  //     </div>
  //   </AuthContext.Provider>
  // )

  return (
    <div className='App w-100 h-100'>
      <Router>
        {false
          ? <Layout><AuthRouter /></Layout>
          : <UnauthRouter />}
      </Router>
    </div>
  )
}

// export default App
export default App
