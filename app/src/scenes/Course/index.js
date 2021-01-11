import React from 'react'
import { Route, Switch } from 'react-router-dom'
import CourseEditor from './CourseEditor'
import CourseFinder from './CourseFinder'
import { PageNotFound } from '../../components/common'

const Index = () => {
  return (
    <div>
      <Switch>
        <Route
          name='Find course'
          path='/course/find'
          render={(props) => <CourseFinder {...props} />}
        />
        <Route
          name='Create course'
          path='/course/new'
          render={(props) => <CourseEditor {...props} isCreating />}
        />
        <Route
          name='Edit course'
          path='/course/:id'
          render={(props) => <CourseEditor {...props} isCreating={false} />}
        />
        <Route name='Page Not Found' component={PageNotFound} />
      </Switch>
    </div>
  )
}

export default Index
