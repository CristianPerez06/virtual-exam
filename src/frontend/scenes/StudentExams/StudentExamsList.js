import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { Button } from 'reactstrap'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { useAuthContext } from '../../hooks'
import mapStudents from '../../common/utils'
import { TranslatableErrors, LoadingInline, NoResults, Table, DeleteModal, ModalWrapper } from '../../components/common'
import { injectIntl, FormattedMessage } from 'react-intl'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { LIST_EXAMS, FINISH_EXAM } from '../../common/requests/exams'
import { LIST_ASSIGNED_EXAMS, DELETE_ASSIGNED_EXAM } from '../../common/requests/assignedExams'
import { LIST_COURSES } from '../../common/requests/courses'
import { syncCacheOnFinishExam, syncCacheOnDelete } from './cacheHelpers'
import { format } from 'date-fns'

const StudentExamsList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // Hooks
  const { cognito } = useAuthContext()

  // State
  const [fetchingStudents, setFetchingStudents] = useState(false)
  const [courses, setCourses] = useState([])
  const [errors, setErrors] = useState()
  const [assignedExams, setAssignedExams] = useState([])
  const [exams, setExams] = useState([])
  const [students, setStudents] = useState([])
  const [filters, setFilters] = useState({ selectedCourse: null, selectedStudent: null })
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
  const [assignedExamToDelete, setAssignedExamToDelete] = useState(false)
  const [finishConfirmModalIsOpen, setFinishConfirmModalIsOpen] = useState(false)
  const [examToFinish, setExamToFinish] = useState()

  // Button handlers
  const onDeleteClicked = (assignedExam) => {
    setAssignedExamToDelete(assignedExam)
    setDeleteModalIsOpen(true)
  }

  const onCancelDeleteClicked = () => {
    if (deletingAssignedExam) return
    setAssignedExamToDelete()
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

  const onFinishExamClicked = (exam) => {
    setExamToFinish(exam)
    setFinishConfirmModalIsOpen(true)
  }

  const onCancelFinishClicked = () => {
    if (finishingExam) return
    setExamToFinish()
    setFinishConfirmModalIsOpen(!finishConfirmModalIsOpen)
  }

  const onConfirmFinishClicked = () => {
    finishExam({
      variables: { id: examToFinish.id, answerPerExerciseList: [] },
      update: (cache, result) => {
        const variables = {
          idNumber: (filters.selectedStudent || {}).value,
          courseId: (filters.selectedCourse || {}).value
        }
        const updatedExamsList = syncCacheOnFinishExam(cache, result.data.finishExam, variables)
        setExams(updatedExamsList.data)
      }
    })
    setFinishConfirmModalIsOpen(false)
  }

  // Handlers
  const onFetchStudentsSuccess = (data) => {
    // TO DO - Handle error when no users where returned from AWS
    const { Users } = data
    const mappedStudents = mapStudents(Users)
    setStudents(mappedStudents)
    setErrors()
    setFetchingStudents(false)
  }

  const onFetchCoursesSuccess = (result) => {
    if (!result) return
    const mappedCourses = result.listCourses.data.map((course) => {
      return {
        value: course.id,
        label: course.name
      }
    })
    setCourses(mappedCourses)
  }

  const onFetchExamsSuccess = (result) => {
    if (!result) return
    setExams(result.listExams.data)
  }

  const onFetchAssignedExamsSuccess = (result) => {
    if (!result) return
    setAssignedExams(result.listAssignedExams.data)
  }

  const onDeleteSuccess = () => {
    setAssignedExamToDelete()
    setErrors()
    setDeleteModalIsOpen(false)
  }

  const onFinishSuccess = (result) => {
    setErrors()
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)

    setErrors(translatableErrors)
  }

  // Queries and mutations
  const { loading: fetchingCourses } = useQuery(LIST_COURSES, { variables: {}, onCompleted: onFetchCoursesSuccess, onError })
  const { loading: fetchingAssignedExams } = useQuery(
    LIST_ASSIGNED_EXAMS,
    {
      variables: {
        idNumber: (filters.selectedStudent || {}).value,
        courseId: (filters.selectedCourse || {}).value
      },
      skip: !filters.selectedStudent && !filters.selectedCourse,
      onCompleted: onFetchAssignedExamsSuccess,
      onError
    }
  )
  const { loading: fetchingExams } = useQuery(
    LIST_EXAMS,
    {
      variables: {
        idNumber: (filters.selectedStudent || {}).value,
        courseId: (filters.selectedCourse || {}).value
      },
      skip: !filters.selectedStudent && !filters.selectedCourse,
      onCompleted: onFetchExamsSuccess,
      onError
    }
  )
  const [deleteAssignedExam, { loading: deletingAssignedExam }] = useMutation(DELETE_ASSIGNED_EXAM, { onCompleted: onDeleteSuccess, onError })
  const [finishExam, { loading: finishingExam }] = useMutation(FINISH_EXAM, { onCompleted: onFinishSuccess, onError })

  // Other
  const columnsExamTranslations = {
    idNumber: formatMessage({ id: 'student_id_number' }),
    dateStarted: formatMessage({ id: 'date_started' }),
    dateFinished: formatMessage({ id: 'date_finished' }),
    courseName: formatMessage({ id: 'course_name' }),
    examName: formatMessage({ id: 'exam_name' }),
    action: formatMessage({ id: 'action' }),
    goToExamDetails: formatMessage({ id: 'button.details' }),
    finishExam: formatMessage({ id: 'button.finish' })
  }

  const columnsExam = [
    {
      Header: columnsExamTranslations.idNumber,
      accessor: 'idNumber',
      Cell: ({ row }) => row.original.idNumber
    },
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
      Header: columnsExamTranslations.examName,
      accessor: 'name',
      Cell: ({ row }) => row.values.name
    },
    {
      Header: columnsExamTranslations.action,
      Cell: ({ row }) => {
        debugger
        return (
          <div className='d-flex justify-content-center'>
            {row.original.completed
              ? (
                <Link to={`/student-exams/${row.original.id}/details`}>
                  <Button color='outline-secondary' className='m-2'>
                    {columnsExamTranslations.goToExamDetails}
                  </Button>
                </Link>
              )
              : (
                <Button
                  color='secondary'
                  className='m-2'
                  disabled={finishingExam}
                  onClick={() => {
                    onFinishExamClicked({ ...row.original })
                  }}
                >
                  {columnsExamTranslations.finishExam}
                </Button>
              )}
          </div>
        )
      }
    }
  ]

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
      Cell: ({ row }) => 'TO DO - Get course name'
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

  useEffect(() => {
    // State cleanup
    setFilters({ selectedCourse: '' })

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
      <div className='filters border shadow p-3 mb-3 bg-white rounded d-block'>
        <p className='text-center h4 mb-4'>
          <FormattedMessage id='common_entity.exams' />
        </p>
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
                setFilters({ selectedCourse: selected, selectedStudent: '' })
                setErrors()
              }}
            />
          </div>
        </div>
        <div className='row d-flex justify-content-center mb-4'>
            <div className='col-md-10 col-xs-12'>
              <span className='text-left pl-1 pb-1'>
                <FormattedMessage id='common_entity.student' />
              </span>
              <Select
                value={filters.selectedStudent}
                options={students}
                isDisabled={fetchingStudents || !filters.selectedCourse}
                onChange={(option) => {
                  const selected = students.find(x => x.value === option.value)
                  setFilters({ ...filters, selectedStudent: selected })
                  setErrors()
                }}
              />
            </div>
          </div>
      </div>

      {/* Errors */}
      {errors && <TranslatableErrors errors={errors} />}

      {/* Assigned exams*/}
      <div className='exams border shadow mb-3 p-2 bg-white rounded d-block'>
        <p className='text-center h5 mb-0'>
          <FormattedMessage id='pending_exams' />
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
          <FormattedMessage id='exams_initiated_finalized' />
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

      {/* Finish eexam modal */}
      <div id='confirm-finish-modal'>
        <ModalWrapper
          modalIsOpen={finishConfirmModalIsOpen}
          headerTextId='common_title.finish_exam_confirmation'
          bodyTextId='confirm_finish_exam'
          buttonTextId='button.confirm'
          buttonColor='danger'
          onCloseClick={() => onCancelFinishClicked()}
          onConfirmClick={() => onConfirmFinishClicked()}
        />
      </div>

    </div>
  )
}

export default injectIntl(StudentExamsList)
