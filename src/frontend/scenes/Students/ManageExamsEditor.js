import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { Button } from 'reactstrap'
import { Form } from 'react-final-form'
import { injectIntl, FormattedMessage } from 'react-intl'
import { useRouteMatch, Link } from 'react-router-dom'
import { format } from 'date-fns'
import mapStudents from '../../common/utils'
import { required } from '../../common/validators'
import { ButtonGoTo, SelectWrapper, TranslatableErrors, Table, DeleteModal, LoadingInline, NoResults } from '../../components/common'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { LIST_COURSES } from '../../common/requests/courses'
import { LIST_VALID_EXAM_TEMPLATES } from '../../common/requests/templates'
import { LIST_EXAMS } from '../../common/requests/exams'
import { LIST_ASSIGNED_EXAMS, CREATE_ASSIGNED_EXAM, DELETE_ASSIGNED_EXAM } from '../../common/requests/assignedExams'
import { syncCacheOnCreate, syncCacheOnDelete } from './cacheHelpers'
import { useAuthContext } from '../../hooks'


const ManageExamsEditor = (props) => {
  // Props
  const { intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()

  // Hooks
  const { cognito } = useAuthContext()

  // State
  const [fetchingStudents, setFetchingStudents] = useState(false)
  const [students, setStudents] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [filters, setFilters] = useState({})
  const [errors, setErrors] = useState()
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
          idNumber: filters.selectedStudent.value
        }
        const updatedAssignedExamsList = syncCacheOnDelete(cache, assignedExamToDelete, variables)
        setAssignedExams(updatedAssignedExamsList.data)
      }
    })
  }

  // Handlers
  const onSuccess = (result) => {
    setErrors()
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
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setDeleteModalIsOpen(false)
    setErrors(translatableErrors)
  }

  const onDeleteSuccess = () => {
    setAssignedExamToDelete()
    setErrors()
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
      onCompleted: onFetchExamsSuccess,
      onError
    }
  )
  const [createAssignedExam, { loading: creating }] = useMutation(CREATE_ASSIGNED_EXAM, { onCompleted: onSuccess, onError })
  const [deleteAssignedExam, { loading: deletingAssignedExam }] = useMutation(DELETE_ASSIGNED_EXAM, { onCompleted: onDeleteSuccess, onError })

  useEffect(() => {
    // State cleanup in case user was editing and now wants to create
    setFilters({ selectedStudent: '' })

    setFetchingStudents(true)
    const getUsers = () => {
      cognito.getUsersList()
        .then(data => {
          // TO DO - Handle error when no users where returned from AWS
          const { Users } = data
          const mappedStudents = mapStudents(Users)
          setStudents(mappedStudents)

          // First load - If idNumber is in URL use it to set selected student
          const { idNumber } = params
          if (idNumber) {
            const selectedStudent = mappedStudents.find(x => x.value === params.idNumber)
            setFilters({ selectedStudent: selectedStudent })
          }

          setErrors()
          setFetchingStudents(false)
        })
        .catch(err => onError(err))
        .finally(() => {
          setFetchingStudents(false)
        })
    }
    getUsers()
  }, [cognito, params])

  // Other
  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.courseId) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.examTemplateId) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    return errors
  }

  const columnsAssignedExamsTranslations = {
    idNumber: formatMessage({ id: 'student_id_number' }),
    courseName: formatMessage({ id: 'course_name' }),
    examTemplateName: formatMessage({ id: 'exam_template_name' }),
    action: formatMessage({ id: 'action' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columnsAssignedExams = [
    {
      Header: columnsAssignedExamsTranslations.idNumber,
      accessor: 'idNumber',
      Cell: ({ row }) => row.original.idNumber
    },
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
    goToExamDetails: formatMessage({ id: 'button.details' })
  }

  const columnsExam = [
    {
      Header: columnsExamTranslations.dateStarted,
      accessor: 'dateStarted',
      Cell: ({ row }) => format(new Date(row.original.created), 'yyyy-MM-dd')
    },
    {
      Header: columnsExamTranslations.dateFinished,
      accessor: 'dateFinished',
      Cell: ({ row }) => {
        return (row.original.updated && row.original.completed === true)
          ? format(new Date(row.original.updated), 'yyyy-MM-dd')
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
                    isDisabled={params.idNumber || fetchingStudents}
                    onChange={(option) => {
                      const selected = students.find(x => x.value === option.value)
                      setFilters({ selectedStudent: selected })
                      setErrors()
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
                      setErrors()
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

      {/* Errors */}
      <div id='info' className='d-flex justify-content-around mt-3'>
        {errors && <TranslatableErrors errors={errors} className='ml-3' />}
      </div>

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
