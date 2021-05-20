import React from 'react'
import { Route, Switch } from 'react-router-dom'
import ExercisesEditor from './ExercisesEditor'
import ExercisesList from './ExercisesList'
import AnswersEditor from './AnswersEditor'
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
        name='Answers editor'
        path='/exercises/:exerciseId/answers/new'
        render={(props) => <AnswersEditor {...props} isCreating />}
      />
      <Route
        name='Answers editor'
        path='/exercises/:exerciseId/answers/:answerId'
        render={(props) => <AnswersEditor {...props} isCreating={false} />}
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
