import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthRouter, UnauthRouter } from '../routers'
import { Loading } from '../components/common'
import { ACCOUNT_ACTION_TYPES } from '../common/constants'
import { useAuthContext } from '../hooks'

const MainRouter = () => {
  // Hooks
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState()
  const { dispatch, cognito } = useAuthContext()

  useEffect(() => {
    const getCurrentSession = async () => {
      try {
        const session = await cognito.getSession()
        const { user, accessToken } = session
        dispatch({
          type: ACCOUNT_ACTION_TYPES.LOGIN,
          payload: { user: user.username, token: accessToken.jwtToken }
        })
        setUser(user.username)
      } catch {
        dispatch({
          type: ACCOUNT_ACTION_TYPES.LOGOUT,
          payload: {}
        })
        setUser(null)
      }
      setIsLoading(false)
    }

    getCurrentSession()
  }, [dispatch, cognito])

  if (isLoading) { return <Loading /> }

  return (
    <Router>
      {user ? <AuthRouter /> : <UnauthRouter />}
    </Router>
  )
}

export default MainRouter
