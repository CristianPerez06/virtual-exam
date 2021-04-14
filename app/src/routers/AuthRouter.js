import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Layout } from '../components/layout'
import { PageNotFound, Error } from '../components/common'
import { Home } from '../components'
import { AsyncCourses, AsyncUnits, AsyncSettings, AsyncExercises } from './Lazyimports'

const AuthRouter = () => {
  return (
    <Layout>
      <Switch>
        <Route path='/' exact name='Home' component={Home} />
        <Route exact path='/login'>
          <Redirect to='/' />
        </Route>
        <Route path='/courses' name='Course' component={AsyncCourses} />
        <Route path='/units' name='Unit' component={AsyncUnits} />
        <Route path='/exercises' name='Exercises' component={AsyncExercises} />
        <Route path='/settings' name='Settings' component={AsyncSettings} />
        <Route name='/error' component={Error} />
        <Route name='Page Not Found' component={PageNotFound} />
      </Switch>
    </Layout>
  )
}

export default AuthRouter
