import React from 'react'
import { Route, Switch } from 'react-router-dom'
import AssignExamEditor from './AssignExamEditor'
import StudentsList from './StudentsList'
import { PageNotFound } from '../../components/common'

const Index = () => {
  return (
    <Switch>
      <Route
        name='Students List'
        path='/students/list'
        render={(props) => <StudentsList {...props} />}
      />
      <Route
        name='Students Exam editor'
        path='/students/:idNumber/assign-exam'
        render={(props) => <AssignExamEditor {...props} />}
      />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default Index
