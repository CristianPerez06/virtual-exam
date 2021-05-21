import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Settings from './Settings'
import { PageNotFound } from '../../components/common'

const Index = () => {
  return (
    <Switch>
      <Route
        name='Settings'
        path='/settings'
        render={(props) => <Settings {...props} />}
      />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default Index
