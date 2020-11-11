import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthRouter, UnauthRouter } from '../routers'
import { Layout } from '../components/layout'
import { useAuthContext } from '../hooks'

const Main = () => {
  const { state } = useAuthContext()

  return (
    <Router>
      {state.isAuthenticated
        ? <Layout><AuthRouter /></Layout>
        : <UnauthRouter />}
    </Router>
  )
}

export default Main
