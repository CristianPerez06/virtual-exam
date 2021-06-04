import React from 'react'
import { Route, Switch } from 'react-router-dom'
import StudentExamsList from './StudentExamsList'
import ViewExam from './ViewExam'
import { PageNotFound } from '../../components/common'

const Index = () => {
  return (
    <Switch>
      <Route
        name='Students List'
        path='/student-exams/list'
        render={(props) => <StudentExamsList {...props} />}
      />
      <Route
        name='View exam'
        path='/student-exams/:id/details'
        render={(props) => <ViewExam {...props} />}
      />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default Index
