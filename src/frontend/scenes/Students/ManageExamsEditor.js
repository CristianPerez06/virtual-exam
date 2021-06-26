import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { Button } from 'reactstrap'
import { Form } from 'react-final-form'
import { injectIntl, FormattedMessage } from 'react-intl'
import { useRouteMatch, Link } from 'react-router-dom'
import { format } from 'date-fns'
import mapStudents from '../../common/utils'
import { required } from '../../common/validators'
import { ButtonGoTo, SelectWrapper, Table, DeleteModal, LoadingInline, NoResults } from '../../components/common'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { LIST_COURSES } from '../../common/requests/courses'
import { LIST_VALID_EXAM_TEMPLATES } from '../../common/requests/templates'
import { LIST_EXAMS } from '../../common/requests/exams'
import { LIST_ASSIGNED_EXAMS, CREATE_ASSIGNED_EXAM, DELETE_ASSIGNED_EXAM } from '../../common/requests/assignedExams'
import { syncCacheOnCreate, syncCacheOnDelete } from './cacheHelpers'
import { useAlert, useCognitoUsers } from '../../hooks'

const ManageExamsEditor = (props) => {
  // Props
  const { intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()

  // Hooks
  const { alertSuccess, alertError } = useAlert()
  const [cognitoUsers, fetchingCognitoUsers] = useCognitoUsers()

  // State
  const [students, setStudents] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [filters, setFilters] = useState({})
  const [courses, setCourses] = useState([])
  const [validExamTemplates, setValidExamTemplates] = useState([])
  const [assignedExams, setAssignedExams] = useState([])
  const [exams, setExams] = useState([])
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
  const [assignedExamToDelete, setAssignedExamToDelete] = useState()

  // Button handlers
  const onSubmit = (values) => {
    const { examTemplateId } = values

    createAssignedExam({
      variables: {
        examTemplateId,
        idNumber: filters.selectedStudent.value,
        courseId: filters.selectedCourse.value
      },
      update: (cache, result) => {
        const variables = {
          idNumber: filters.selectedStudent.value,
          courseId: filters.selectedCourse.value
        }

        alertSuccess(formatMessage({ id: 'assigned_exam_created' }))

        const updatedAssignedExamsList = syncCacheOnCreate(cache, result.data.createAssignedExam, variables)
        setAssignedExams(updatedAssignedExamsList.data)
      }
    })
  }

  const onDeleteClicked = (assignedExam) => {
    setAssignedExamToDelete(assignedExam)
    setDeleteModalIsOpen(true)
  }

  const onCancelDeleteClicked = () => {
    if (deletingAssignedExam) return
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  const onConfirmDeleteClicked = () => {
    deleteAssignedExam({
      variables: { id: assignedExamToDelete.id },
      update: (cache, result) => {
        const variables = {
          idNumber: (filters.selectedStudent || {}).value,
          courseId: (filters.selectedCourse || {}).value
        }

        alertSuccess(formatMessage({ id: 'assigned_exam_removed' }))

        const updatedAssignedExamsList = syncCacheOnDelete(cache, assignedExamToDelete, variables)
        setAssignedExams(updatedAssignedExamsList.data)
      }
    })
  }

  // Handlers
  const onSuccess = (result) => {
    setFilters({ ...filters, selectedExamTemplate: '' })
    setInitialValues({})
  }

  const onFetchCoursesSuccess = (result) => {
    if (!result) return
    setCourses(result.listCourses.data)
  }

  const onFetchValidExamTemplatesSuccess = (result) => {
    if (!result) return
    setValidExamTemplates(result.listValidExamTemplates.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    setDeleteModalIsOpen(false)
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
  }

  const onDeleteSuccess = () => {
    setAssignedExamToDelete()
    setDeleteModalIsOpen(false)
  }

  const onFetchAssignedExamsSuccess = (result) => {
    if (!result) return
    setAssignedExams(result.listAssignedExams.data)
  }

  const onFetchExamsSuccess = (result) => {
    if (!result) return
    setExams(result.listExams.data)
  }

  // Queries and mutations
  const { loading: fetchingCourses } = useQuery(
    LIST_COURSES,
    {
      variables: {},
      onCompleted: onFetchCoursesSuccess,
      onError
    }
  )
  const { loading: fetchingValidExamTemplates } = useQuery(
    LIST_VALID_EXAM_TEMPLATES,
    {
      variables: { courseId: (filters.selectedCourse || {}).value },
      skip: !(filters.selectedCourse || {}).value,
      onCompleted: onFetchValidExamTemplatesSuccess,
      onError
    }
  )
  const { loading: fetchingAssignedExams } = useQuery(
    LIST_ASSIGNED_EXAMS,
    {
      variables: {
        idNumber: (filters.selectedStudent || {}).value,
        courseId: (filters.selectedCourse || {}).value
      },
      fetchPolicy: 'network-only',
      skip: !(filters.selectedStudent || {}).value,
      onCompleted: onFetchAssignedExamsSuccess,
      onError
    }
  )
  const { loading: fetchingExams } = useQuery(
    LIST_EXAMS,
    {
      variables: {
        idNumber: (filters.selectedStudent || {}).value,
        courseId: (filters.selectedCourse || {}).value,
        completed: true
      },
      skip: !(filters.selectedStudent || {}).value,
      fetchPolicy: 'network-only',
      onCompleted: onFetchExamsSuccess,
      onError
    }
  )
  const [createAssignedExam, { loading: creating }] = useMutation(CREATE_ASSIGNED_EXAM, { onCompleted: onSuccess, onError })
  const [deleteAssignedExam, { loading: deletingAssignedExam }] = useMutation(DELETE_ASSIGNED_EXAM, { onCompleted: onDeleteSuccess, onError })

  useEffect(() => {
    // State cleanup in case user was editing and now wants to create
    setFilters({ selectedStudent: '' })

    if (!fetchingCognitoUsers) {
      const mappedStudents = mapStudents(cognitoUsers)
      setStudents(mappedStudents)

      // First load - If idNumber is in URL use it to set selected student
      const { idNumber } = params
      if (idNumber) {
        const selectedStudent = mappedStudents.find(x => x.value === params.idNumber)
        setFilters({ selectedStudent: selectedStudent })
      }
    }
  }, [cognitoUsers, fetchingCognitoUsers, params])

  // Other
  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.courseId) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.examTemplateId) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    return errors
  }

  const columnsAssignedExamsTranslations = {
    courseName: formatMessage({ id: 'course_name' }),
    examTemplateName: formatMessage({ id: 'exam_template_name' }),
    action: formatMessage({ id: 'action' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columnsAssignedExams = [
    {
      Header: columnsAssignedExamsTranslations.courseName,
      accessor: 'courseName',
      Cell: ({ row }) => row.original.courseName
    },
    {
      Header: columnsAssignedExamsTranslations.examTemplateName,
      accessor: 'examTemplateName',
      Cell: ({ row }) => row.values.examTemplateName
    },
    {
      Header: columnsAssignedExamsTranslations.action,
      Cell: ({ row }) => (
        <div className='d-flex justify-content-center'>
          <Button
            className='ml-1'
            color='danger'
            disabled={deletingAssignedExam}
            onClick={() => onDeleteClicked({ ...row.original })}
          >
            {columnsAssignedExamsTranslations.delete}
          </Button>
        </div>
      )
    }
  ]

  const columnsExamTranslations = {
    dateStarted: formatMessage({ id: 'date_started' }),
    dateFinished: formatMessage({ id: 'date_finished' }),
    courseName: formatMessage({ id: 'course_name' }),
    examName: formatMessage({ id: 'exam_name' }),
    action: formatMessage({ id: 'action' }),
    score: formatMessage({ id: 'score' }),
    goToExamDetails: formatMessage({ id: 'button.details' })
  }

  const columnsExam = [
    {
      Header: columnsExamTranslations.dateStarted,
      accessor: 'dateStarted',
      Cell: ({ row }) => {
        return (
          <div className='row'>
            <div className='col-md-12 col-xs-12'>
              {format(new Date(row.original.created), 'yyyy-MM-dd')}
            </div>
            <div className='col-md-12 col-xs-12'>
              {format(new Date(row.original.created), 'h:mm a')}
            </div>
          </div>
        )
      }
    },
    {
      Header: columnsExamTranslations.dateFinished,
      accessor: 'dateFinished',
      Cell: ({ row }) => {
        return (row.original.updated && row.original.completed === true)
          ? (
            <>
              <div className='col-md-12 col-xs-12'>
                {format(new Date(row.original.updated), 'yyyy-MM-dd')}
              </div>
              <div className='col-md-12 col-xs-12'>
                {format(new Date(row.original.updated), 'h:mm a')}
              </div>
            </>
            )
          : '-'
      }
    },
    {
      Header: columnsExamTranslations.courseName,
      accessor: 'courseName',
      Cell: ({ row }) => row.original.courseName
    },
    {
      Header: columnsExamTranslations.examName,
      accessor: 'name',
      Cell: ({ row }) => row.original.name
    },
    {
      Header: columnsExamTranslations.score,
      accessor: 'score',
      Cell: ({ row }) => row.original.score !== undefined ? row.original.score : '-'
    },
    {
      Header: columnsExamTranslations.action,
      Cell: ({ row }) => {
        return (
          <div className='d-flex justify-content-center'>
            <Link to={`/students/manage-exams/details/${row.original.id}`}>
              <Button color='outline-secondary' className='m-2'>
                {columnsExamTranslations.goToExamDetails}
              </Button>
            </Link>
          </div>
        )
      }
    }
  ]

  return (
    <div className='students-exam-editor' style={{ width: 850 + 'px' }}>
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        validate={validateBeforeSubmit}
        render={({ handleSubmit, pristine }) => (
          <form onSubmit={handleSubmit}>
            <div className='filters border shadow p-3 mb-3 bg-white rounded d-block'>
              <p className='text-center h4 mb-4'>
                <FormattedMessage id='exams_manage_per_student' />
              </p>

              {/* Select student */}
              <div className='row d-flex justify-content-center mb-2'>
                <div className='col-md-10 col-xs-12'>
                  <span className='text-left pl-1 pb-1'>
                    <FormattedMessage id='common_entity.student' />
                  </span>
                  <Select
                    value={filters.selectedStudent}
                    options={students}
                    isDisabled={params.idNumber || fetchingCognitoUsers}
                    onChange={(option) => {
                      const selected = students.find(x => x.value === option.value)
                      setFilters({ selectedStudent: selected })
                    }}
                  />
                </div>
              </div>

              {/* Select course */}
              <div className='row d-flex justify-content-center mb-2'>
                <div className='col-md-10 col-xs-12'>
                  <span className='text-left pl-1 pb-1'>
                    <FormattedMessage id='common_entity.course' />
                  </span>
                  <SelectWrapper
                    fieldName='courseId'
                    isDisabled={fetchingCourses || !(filters.selectedStudent || {}).value}
                    options={courses}
                    validations={required}
                    selectedValue={(filters.selectedCourse || {}).value}
                    handleOnChange={(selectedOption) => {
                      setFilters({ ...filters, selectedCourse: selectedOption, selectedExamTemplate: {} })
                    }}
                  />
                </div>
              </div>

              <div id='buttons' className='d-flex justify-content-center'>
                <ButtonGoTo
                  path='/students/list'
                  color='secondary'
                  translatableTextId='button.go_to_list'
                  isDisabled={creating}
                />
              </div>
            </div>

            <div className='assign-exam border shadow p-3 mb-3 bg-white rounded d-block'>
              <div className='row d-flex justify-content-center mb-3'>
                <div className='col-md-9 col-xs-12'>
                  <span className='text-left pl-1 pb-1'>
                    <FormattedMessage id='common_entity.exam_template' />
                  </span>
                  <SelectWrapper
                    fieldName='examTemplateId'
                    isDisabled={fetchingValidExamTemplates || !(filters.selectedCourse || {}).value}
                    options={validExamTemplates}
                    validations={required}
                    selectedValue={filters.selectedExamTemplate}
                    handleOnChange={(option) => {
                      setFilters({ ...filters, selectedExamTemplate: option.value })
                    }}
                  />
                </div>
                <div className='col-md-3 col-xs-12 text-right mt-4'>
                  <Button
                    color='primary'
                    type='submit'
                    disabled={creating || fetchingCourses || fetchingValidExamTemplates || pristine}
                  >
                    <FormattedMessage id='button.assign_exam' />
                    {creating && <LoadingInline className='ml-3' />}
                  </Button>
                </div>
              </div>
            </div>

          </form>
        )}
      />

      {/* Assigned exams */}
      <div className='assigned-exams border shadow mb-3 p-2 bg-white rounded d-block'>
        <p className='text-center h5 mb-0'>
          <FormattedMessage id='assigned_exams' />
        </p>
        <div className='row'>
          <div className='col-md-12 col-xs-12'>
            {fetchingAssignedExams && <div className='text-center'><LoadingInline color='grey' /></div>}
            {!fetchingAssignedExams && assignedExams.length === 0 && <NoResults />}
            {!fetchingAssignedExams && assignedExams.length !== 0 && <Table columns={columnsAssignedExams} data={assignedExams} />}
          </div>
        </div>
      </div>

      {/* Exams */}
      <div className='exams border shadow mb-3 p-2 bg-white rounded d-block'>
        <p className='text-center h5 mb-0'>
          <FormattedMessage id='exams_finalized' />
        </p>
        <div className='row'>
          <div className='col-md-12 col-xs-12'>
            {fetchingExams && <div className='text-center'><LoadingInline color='grey' /></div>}
            {!fetchingExams && exams.length === 0 && <NoResults />}
            {!fetchingExams && exams.length !== 0 && <Table columns={columnsExam} data={exams} />}
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <div id='delete-modal'>
        <DeleteModal
          modalIsOpen={deleteModalIsOpen}
          isBussy={deletingAssignedExam}
          onCloseClick={() => onCancelDeleteClicked()}
          onDeleteClick={() => onConfirmDeleteClicked()}
        />
      </div>

    </div>
  )
}

export default injectIntl(ManageExamsEditor)
