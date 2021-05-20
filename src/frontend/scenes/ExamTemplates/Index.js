import React from 'react'
import { Route, Switch } from 'react-router-dom'
import ExamTemplatesEditor from './ExamTemplatesEditor'
import ExamTemplatesList from './ExamTemplatesList'
import { PageNotFound } from '../../components/common'

const Index = () => {
  return (
    <Switch>
      <Route
        name='List Exam templates'
        path='/exam-templates/list'
        render={(props) => <ExamTemplatesList {...props} />}
      />
      <Route
        name='Exam templates editor'
        path='/exam-templates/new'
        render={(props) => <ExamTemplatesEditor {...props} isCreating />}
      />
      <Route
        name='Exam templates editor'
        path='/exam-templates/:id'
        render={(props) => <ExamTemplatesEditor {...props} isCreating={false} />}
      />
      <Route name='Page Not Found' component={PageNotFound} />
    </Switch>
  )
}

export default Index
