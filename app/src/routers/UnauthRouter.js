import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

// Components
import { Login, PasswordChange, SignUp, ForgotPassword } from '../scenes/Account'

const UnauthRouter = () => {
  return (
    <Switch>
      <Route path='/login' name='Login' component={Login} exact />
      <Route path='/password-change' name='Password change' component={PasswordChange} exact />
      <Route path='/sign-up' name='Register' component={SignUp} exact />
      <Route path='/forgot-password' name='Forgot password' component={ForgotPassword} exact />
      <Redirect push to='/login' />
    </Switch>
  )
}

export default UnauthRouter
