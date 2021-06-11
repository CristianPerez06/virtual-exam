import React from 'react'
import { Route, Switch } from 'react-router-dom'
import ManageExamsEditor from './ManageExamsEditor'
import StudentsList from './StudentsList'
import ViewExam from './ViewExam'
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
        name='Student Exam details'
        path='/students/manage-exams/details/:examId'
        render={(props) => <ViewExam {...props} />}
      />
      <Route
        name='Students Exam editor'
        path='/students/manage-exams/:idNumber?'
        render={(props) => <ManageExamsEditor {...props} />}
      />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default Index
