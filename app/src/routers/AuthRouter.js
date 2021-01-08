import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { PageNotFound } from '../components/common'
import { Home } from '../components'
import { Course } from '../scenes/Course'

const AuthRouter = () => {
  return (
    <Switch>
      <Route path='/' exact name='Home' component={Home} />
      <Route
        name='Create course'
        path='/course/new'
        render={(props) => <Course {...props} isCreating />}
      />
      <Route
        name='Edit course'
        path='/course/:id'
        render={(props) => <Course {...props} isCreating={false} />}
      />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default AuthRouter
