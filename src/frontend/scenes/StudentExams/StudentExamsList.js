import React, { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import Select from 'react-select'
import { useQuery } from '@apollo/react-hooks'
import { useAuthContext } from '../../hooks'
import { TranslatableErrors } from '../../components/common'
import { injectIntl, FormattedMessage } from 'react-intl'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { LIST_EXAMS } from '../../common/requests/exams'
import TableExams from './TableExams'
// import { LIST_COURSES } from '../../common/requests/courses'

const StudentExamsList = (props) => {
  // Hooks
  const { cognito } = useAuthContext()

  // State
  const [fetchingStudents, setFetchingStudents] = useState(false)
  // const [courses, setCourses] = useState([])
  const [errors, setErrors] = useState()
  const [exams, setExams] = useState([])
  const [students, setStudents] = useState([])
  const [filters, setFilters] = useState({ selectedStudent: null, selectedCourse: null })

  // Handlers
  const onFetchStudentsSuccess = (data) => {
    const { Users } = data
    const mappedStudents = Users.map((user) => {
      return {
        value: user.Username,
        label: user.Attributes.find(x => x.Name === 'name').Value + ' ' + user.Attributes.find(x => x.Name === 'family_name').Value
      }
    })
    setStudents(mappedStudents)
    setErrors()
    setFetchingStudents(false)
  }

  // const onFetchCoursesSuccess = (result) => {
  //   if (!result) return
  //   const mappedCourses = result.listCourses.data.map((course) => {
  //     return {
  //       value: course.id,
  //       label: course.name
  //     }
  //   })
  //   setCourses(mappedCourses)
  // }

  const onFetchExamsSuccess = (result) => {
    if (!result) return
    setExams(result.listExams.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)

    setErrors(translatableErrors)
  }

  // Queries and mutations
  // const { loading: fetchingCourses } = useQuery(LIST_COURSES, { variables: {}, onCompleted: onFetchCoursesSuccess, onError })
  const { loading: fetchingExams } = useQuery(
    LIST_EXAMS,
    {
      variables: { idNumber: (filters.selectedStudent || {}).value },
      skip: !filters.selectedStudent,
      onCompleted: onFetchExamsSuccess,
      onError
    }
  )

  useEffect(() => {
    setFetchingStudents(true)
    const getUsers = () => {
      cognito.getUsersList()
        .then(data => onFetchStudentsSuccess(data))
        .catch(err => onError(err))
        .finally(() => { setFetchingStudents(false) })
    }

    getUsers()
  }, [cognito])

  return (
    <div className='student-exams-list' style={{ width: 850 + 'px' }}>
      <Card className='mx-auto shadow mb-3 bg-white rounded'>
        <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
          <p className='h4'>
            <FormattedMessage id='common_entity.exams' />
          </p>
        </CardHeader>
        <CardBody className='d-flex flex-column text-center'>
          <div className='row d-flex justify-content-center mb-4'>
            <div className='col-md-10 col-xs-12'>
              <span className='text-left pl-1 pb-1'>
                <FormattedMessage id='common_entity.student' />
              </span>
              <Select
                value={filters.selectedStudent}
                options={students}
                isDisabled={fetchingStudents}
                onChange={(option) => {
                  const selected = students.find(x => x.value === option.value)
                  setFilters({ selectedStudent: selected, selectedCourse: null })
                  setErrors()
                }}
              />
            </div>
          </div>
          {/*
          <div className='row d-flex justify-content-center mb-4'>
            <div className='col-md-10 col-xs-12'>
              <span className='text-left pl-1 pb-1'>
                <FormattedMessage id='common_entity.course' />
              </span>
              <Select
                value={filters.selectedCourse}
                options={courses}
                isDisabled={fetchingCourses}
                onChange={(option) => {
                  const selected = courses.find(x => x.value === option.value)
                  setFilters({ selectedCourse: selected, selectedUnit: null })
                  setErrors()
                }}
              />
            </div>
          </div>
          */}
          <TableExams
            loading={fetchingExams}
            exams={exams}
          />
        </CardBody>
      </Card>
      {errors && <TranslatableErrors errors={errors} />}
    </div>
  )
}

export default injectIntl(StudentExamsList)
