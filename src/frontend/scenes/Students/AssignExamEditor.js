import React, { useState } from 'react'
import { Button } from 'reactstrap'
import { Form } from 'react-final-form'
import { injectIntl, FormattedMessage } from 'react-intl'
import { useRouteMatch } from 'react-router-dom'
import { required } from '../../common/validators'
import { ButtonGoTo, SelectWrapper, TranslatableErrors, Table, DeleteModal, LoadingInline, NoResults } from '../../components/common'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { LIST_COURSES } from '../../common/requests/courses'
import { LIST_EXAM_TEMPLATES } from '../../common/requests/templates'
import { LIST_ASSIGNED_EXAMS, CREATE_ASSIGNED_EXAM, DELETE_ASSIGNED_EXAM } from '../../common/requests/assignedExams'
import { syncCacheOnCreate, syncCacheOnDelete } from './cacheHelpers'

const AssignExamEditor = (props) => {
  // Props
  const { intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()

  // State
  const [initialValues, setInitialValues] = useState()
  const [filters, setFilters] = useState({})
  const [errors, setErrors] = useState()
  const [courses, setCourses] = useState([])
  const [examTemplates, setExamTemplates] = useState([])
  const [assignedExams, setAssignedExams] = useState([])
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
  const [assignedExamToDelete, setAssignedExamToDelete] = useState(false)

  // Button handlers
  const onSubmit = (values) => {
    const { examTemplateId } = values

    createAssignedExam({
      variables: { examTemplateId, idNumber: params.idNumber },
      update: (cache, result) => {
        const variables = { idNumber: params.idNumber }
        const updatedAssignedExamsList = syncCacheOnCreate(cache, result.data.createAssignedExam, variables)
        setAssignedExams(updatedAssignedExamsList.data)
      }
    })
  }

  const onDeleteClicked = (assignedExam) => {
    setAssignedExamToDelete(assignedExam)
    setDeleteModalIsOpen(true)
  }

  const onCancelClicked = () => {
    if (deletingAssignedExam) return
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  const onDeleteConfirmClicked = () => {
    deleteAssignedExam({
      variables: { id: assignedExamToDelete.id },
      update: (cache, result) => {
        const variables = { idNumber: params.idNumber }
        const updatedAssignedExamsList = syncCacheOnDelete(cache, assignedExamToDelete, variables)
        setAssignedExams(updatedAssignedExamsList.data)
      }
    })
  }

  // Handlers
  // TO DO - Get User info to display in component

  const onSuccess = (result) => {
    setErrors()
    setFilters({})
    setInitialValues({ selectedCourse: '', selectedExamTemplate: '' })
  }

  const onFetchCoursesSuccess = (result) => {
    if (!result) return
    setCourses(result.listCourses.data)
  }

  const onFetchExamTemplatesSuccess = (result) => {
    if (!result) return
    setExamTemplates(result.listExamTemplates.data)
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

  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.courseId) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.examTemplateId) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    return errors
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
  const { loading: fetchingExamTemplates } = useQuery(
    LIST_EXAM_TEMPLATES,
    {
      variables: { courseId: filters.selectedCourse },
      skip: !filters.selectedCourse,
      onCompleted: onFetchExamTemplatesSuccess,
      onError
    }
  )
  const { loading: fetchingAssignedExams } = useQuery(
    LIST_ASSIGNED_EXAMS,
    {
      variables: { idNumber: params.idNumber },
      onCompleted: onFetchAssignedExamsSuccess,
      onError
    }
  )
  const [createAssignedExam, { loading: creating }] = useMutation(CREATE_ASSIGNED_EXAM, { onCompleted: onSuccess, onError })
  const [deleteAssignedExam, { loading: deletingAssignedExam }] = useMutation(DELETE_ASSIGNED_EXAM, { onCompleted: onDeleteSuccess, onError })

  const columnTranslations = {
    courseName: formatMessage({ id: 'course_name' }),
    examTemplateName: formatMessage({ id: 'exam_template_name' }),
    action: formatMessage({ id: 'action' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columns = React.useMemo(
    () => {
      return [{
        Header: columnTranslations.courseName,
        accessor: 'examTemplateId',
        Cell: ({ row }) => 'TO DO - GET COURSE'
      },
      {
        Header: columnTranslations.examTemplateName,
        accessor: 'examTemplateName',
        Cell: ({ row }) => row.values.examTemplateName
      },
      {
        Header: columnTranslations.action,
        Cell: ({ row }) => (
          <div className='d-flex justify-content-center'>
            <Button
              className='ml-1'
              color='danger'
              onClick={() => onDeleteClicked({ ...row.original })}
            >
              {columnTranslations.delete}
            </Button>
          </div>
        )
      }]
    },
    [columnTranslations]
  )

  return (
    <div className='students-exam--editor bg-light p-5' style={{ width: 850 + 'px' }}>
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        validate={validateBeforeSubmit}
        render={({ handleSubmit, pristine }) => (
          <form onSubmit={handleSubmit}>
            <p className='text-center h4 mb-4'>
              <FormattedMessage id='assign_exam' />
            </p>
            <div className='row d-flex justify-content-center mb-4'>
              <div className='col-md-10 col-xs-12'>
                <span className='text-left pl-1 pb-1'>
                  <FormattedMessage id='common_entity.course' />
                </span>
                <SelectWrapper
                  fieldName='courseId'
                  isDisabled={fetchingCourses}
                  options={courses}
                  validations={required}
                  selectedValue={filters.selectedCourse}
                  handleOnChange={(option) => {
                    setFilters({ ...filters, selectedCourse: option.value })
                  }}
                />
              </div>
            </div>

            <div className='row d-flex justify-content-center mb-4'>
              <div className='col-md-10 col-xs-12'>
                <span className='text-left pl-1 pb-1'>
                  <FormattedMessage id='common_entity.exam_template' />
                </span>
                <SelectWrapper
                  fieldName='examTemplateId'
                  isDisabled={fetchingExamTemplates || !filters.selectedCourse}
                  options={examTemplates}
                  validations={required}
                  selectedValue={filters.selectedExamTemplate}
                  handleOnChange={(option) => {
                    setFilters({ ...filters, selectedExamTemplate: option.value })
                  }}
                />
              </div>
            </div>

            <hr />

            <div id='assigned-exams' className='mt-5'>
              <p className='text-center h5 mb-3'>
                <FormattedMessage id='assigned_exams' />
              </p>

              {!fetchingAssignedExams && (
                <div className='row'>
                  <div className='col-md-12 col-xs-12'>
                    {assignedExams.length === 0
                      ? <NoResults />
                      : <Table columns={columns} data={assignedExams} paginationEnabled={false} />}
                  </div>
                </div>
              )}

              {/* Delete modal */}
              <div id='delete-modal'>
                <DeleteModal
                  modalIsOpen={deleteModalIsOpen}
                  isBussy={deletingAssignedExam}
                  onCloseClick={() => onCancelClicked()}
                  onDeleteClick={() => onDeleteConfirmClicked()}
                />
              </div>
            </div>

            <hr />

            <div id='buttons' className='d-flex justify-content-center'>
              <Button
                color='primary'
                type='submit'
                className='m-2'
                disabled={creating || fetchingCourses || fetchingExamTemplates || pristine}
              >
                <FormattedMessage id='button.assign_exam' />
                {creating && <LoadingInline className='ml-3' />}
              </Button>
              <ButtonGoTo
                path='/students/list'
                color='secondary'
                translatableTextId='button.go_to_list'
                isDisabled={creating}
              />
            </div>

            <div id='info' className='d-flex justify-content-around mt-2'>
              {errors && <TranslatableErrors errors={errors} className='ml-3' />}
            </div>
          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(AssignExamEditor)
