import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Layout } from '../components/layout'
import { PageNotFound, Error } from '../components/common'
import { Home } from '../components'
import { AsyncCourse, AsyncSettings } from './Lazyimports'

const AuthRouter = () => {
  return (
    <Layout>
      <Switch>
        <Route path='/' exact name='Home' component={Home} />
        <Route path='/course' name='Course' component={AsyncCourse} />
        <Route path='/settings' name='Settings' component={AsyncSettings} />
        <Route name='/error' component={Error} />
        <Route name='Page Not Found' component={PageNotFound} />
      </Switch>
    </Layout>
  )
}

export default AuthRouter
