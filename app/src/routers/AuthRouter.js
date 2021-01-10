import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { PageNotFound } from '../components/common'
import { Home } from '../components'
import { AsyncCourse } from './Lazyimports'

const AuthRouter = () => {
  return (
    <Switch>
      <Route path='/' exact name='Home' component={Home} />
      <Route path='/course' name='Course' component={AsyncCourse} />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default AuthRouter
