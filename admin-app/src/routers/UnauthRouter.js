import React from 'react'
import { Route, Switch } from 'react-router-dom'

// Components
import { Login } from '../scenes/Login'

const UnauthRouter = () => {
  return <Switch>
    <Route path='/login' component={Login} />
    <Route name='Login' component={Login} />
  </Switch>
}

export default UnauthRouter
