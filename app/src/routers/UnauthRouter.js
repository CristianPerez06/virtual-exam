import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

// Components
import { Login, PasswordChange, SignUp, ForgotPassword } from '../scenes/Account'

const UnauthRouter = () => {
  console.log('UnauthRouter')
  return (
    <Switch>
      <Route path='/login' name='Login' component={Login} />
      <Route path='/password-change' name='Password change' component={PasswordChange} />
      <Route path='/sign-up' name='Register' component={SignUp} />
      <Route path='/forgot-password' name='Forgot password' component={ForgotPassword} />
      <Redirect to='login' />
    </Switch>
  )
}

export default UnauthRouter
