import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthRouter, UnauthRouter } from '../routers'
import { Loading } from '../components/common'
import { ACCOUNT_ACTION_TYPES } from '../common/constants'
import { useAuthContext } from '../hooks'

const Main = () => {
  const { dispatch, cognito } = useAuthContext()

  // hooks
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getAndRefreshSession = async () => {
      try {
        const session = await cognito.getSession()
        const refresh = await cognito.refreshSession(session)
        const { user } = session
        const { accessToken } = refresh
        dispatch({
          type: ACCOUNT_ACTION_TYPES.REFRESH,
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

    getAndRefreshSession()
  }, [dispatch, cognito])

  if (isLoading) { return <Loading /> }

  return (
    <Router>
      {user ? <AuthRouter /> : <UnauthRouter />}
    </Router>
  )
}

export default Main
