import React from 'react'
import { Route, Switch } from 'react-router-dom'
import MetricsIndex from './MetricsIndex'
import { PageNotFound } from '../../components/common'

const Index = () => {
  return (
    <Switch>
      <Route
        name='Metrics'
        path='/metrics'
        render={(props) => <MetricsIndex {...props} />}
      />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default Index
