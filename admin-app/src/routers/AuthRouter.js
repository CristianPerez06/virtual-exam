import React from 'react'
import { Route, Switch } from 'react-router-dom'

// Components
import { PageNotFound } from '../components/common'
// import { User } from '../../scenes/User'

const AuthRouter = () => {
  return <Switch>
    {/* <Route path='/User' component={User} /> */}
    <Route name='Page Not Found' component={PageNotFound} />
  </Switch>
}

export default AuthRouter
