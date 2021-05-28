import React from 'react'
import { Route, Switch } from 'react-router-dom'
import ExamsList from './ExamsList'
import TakeExam from './TakeExam'
import ViewExam from './ViewExam'
import { PageNotFound } from '../../components/common'

const Index = () => {
  return (
    <Switch>
      <Route
        name='List assigned exams'
        path='/exams/list'
        render={(props) => <ExamsList {...props} />}
      />
      <Route
        name='Take exam'
        path='/exams/:id/details'
        render={(props) => <ViewExam {...props} />}
      />
      <Route
        name='Take exam'
        path='/exams/:id'
        render={(props) => <TakeExam {...props} />}
      />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default Index
