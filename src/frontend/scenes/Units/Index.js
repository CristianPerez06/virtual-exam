import React from 'react'
import { Route, Switch } from 'react-router-dom'
import UnitsEditor from './UnitsEditor'
import UnitsList from './UnitsList'
import { PageNotFound } from '../../components/common'

const Index = () => {
  return (
    <Switch>
      <Route
        name='Units List'
        path='/units/list'
        render={(props) => <UnitsList {...props} />}
      />
      <Route
        name='Units editor'
        path='/units/new'
        render={(props) => <UnitsEditor {...props} isCreating />}
      />
      <Route
        name='Units editor'
        path='/units/:id'
        render={(props) => <UnitsEditor {...props} isCreating={false} />}
      />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default Index
