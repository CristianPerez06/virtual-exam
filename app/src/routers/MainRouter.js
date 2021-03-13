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
    cognito.getSession()
      .then(data => {
        const { user, accessToken } = data
        dispatch({
          type: ACCOUNT_ACTION_TYPES.REFRESH,
          payload: { user: user.username, token: accessToken.jwtToken }
        })
        setUser(user.username)
        setIsLoading(false)
      })
      .catch(err => {
        console.log(err)
        setUser(null)
        setIsLoading(false)
      })
  }, [dispatch, cognito])

  if (isLoading) { return <Loading /> }

  return (
    <Router>
      {user ? <AuthRouter /> : <UnauthRouter />}
    </Router>
  )
}

export default Main
