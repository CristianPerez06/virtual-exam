import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { PageNotFound } from '../components/common'
import { Home } from '../components'
import { AsyncCourse, AsyncSettings } from './Lazyimports'

const AuthRouter = () => {
  return (
    <Switch>
      <Route path='/' exact name='Home' component={Home} />
      <Route path='/course' name='Course' component={AsyncCourse} />
      <Route path='/settings' name='Settings' component={AsyncSettings} />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default AuthRouter
