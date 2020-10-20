import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AuthRouter from './AuthRouter'
import UnauthRouter from './UnauthRouter'

const MainRouter = () => {
  const authenticated = false
  return (
    <Router>
      {authenticated
        ? <AuthRouter />
        : <UnauthRouter />}
    </Router>
  )
}

export default MainRouter
