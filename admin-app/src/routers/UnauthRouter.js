import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

// Components
import { Login } from '../scenes/Account'

const UnauthRouter = () => {
  console.log('UnauthRouter')
  return (
    <Switch>
      <Route path='/login' name='Login' component={Login} />
      <Redirect to='login' />
    </Switch>
  )
}

export default UnauthRouter
