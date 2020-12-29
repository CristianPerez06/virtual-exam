import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { PageNotFound } from '../components/common'
import { Home, Contact } from '../components'
import { User } from '../scenes/User'

const AuthRouter = () => {
  return (
    <Switch>
      <Route path='/' exact name='Home' component={Home} />
      <Route path='/contact' name='Contact' component={Contact} />
      <Route path='/user' name='User' component={User} />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default AuthRouter
