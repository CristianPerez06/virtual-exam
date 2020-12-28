import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { PageNotFound } from '../components/common'
import { Home, Contact } from '../components'
import { JustTesting } from '../scenes/Other'

const AuthRouter = () => {
  return (
    <Switch>
      <Route path='/' exact name='Home' component={Home} />
      <Route path='/contact' name='Contact' component={Contact} />
      <Route path='/just-testing' name='Just testing' component={JustTesting} />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default AuthRouter
