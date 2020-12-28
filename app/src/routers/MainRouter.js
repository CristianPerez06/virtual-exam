import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthRouter, UnauthRouter } from '../routers'
import { Layout } from '../components/layout'
import { useAuthContext } from '../hooks'

const Main = () => {
  const { state, cognito } = useAuthContext()

  const cognitoAuthenticated = () => {
    const user = cognito.pool.getCurrentUser()
    return !!user
  }

  return (
    <Router>
      {state.isAuthenticated || cognitoAuthenticated()
        ? <Layout><AuthRouter /></Layout>
        : <UnauthRouter />}
    </Router>
  )
}

export default Main
