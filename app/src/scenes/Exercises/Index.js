import React from 'react'
import { Route, Switch } from 'react-router-dom'
import ExercisesEditor from './ExercisesEditor'
import ExercisesList from './ExercisesList'
import { PageNotFound } from '../../components/common'

const Index = () => {
  return (
    <Switch>
      <Route
        name='Exercises List'
        path='/exercises/list'
        render={(props) => <ExercisesList {...props} />}
      />
      <Route
        name='Exercises editor'
        path='/exercises/new'
        render={(props) => <ExercisesEditor {...props} isCreating />}
      />
      <Route
        name='Exercises editor'
        path='/exercises/:id'
        render={(props) => <ExercisesEditor {...props} isCreating={false} />}
      />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default Index
