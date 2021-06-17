import React, { useState, useEffect } from 'react'
import { Button } from 'reactstrap'
import { Form } from 'react-final-form'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { ButtonSubmit, ButtonGoTo, FieldWrapper, SelectWrapper, TranslatableTitle, TranslatableErrors, ModalWrapper } from '../../components/common'
import { required } from '../../common/validators'
import { injectIntl, FormattedMessage } from 'react-intl'
import { CREATE_EXAM_TEMPLATE, GET_EXAM_TEMPLATE, UPDATE_EXAM_TEMPLATE, RESET_EXAM_TEMPLATE } from '../../common/requests/templates'
import { LIST_COURSES } from '../../common/requests/courses'
import { syncCacheOnCreate, syncCacheOnUpdate, syncCacheOnResetTemplateExercises } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import ExamTemplateExercises from './components/ExamTemplateExercises'

const ExamTemplatesEditor = (props) => {
  // Props and params
  const { isCreating, intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()
  const history = useHistory()

  // State
  const [courses, setCourses] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [filters, setFilters] = useState({})
  const [errors, setErrors] = useState()
  const [editableCourse, setEditableCourse] = useState(false)
  const [editConfirmModalIsOpen, setEditConfirmModalIsOpen] = useState(false)

  // Handlers
  const onSuccess = (result) => {
    if (result.createExamTemplate) {
      const { id } = result.createExamTemplate

      // setTemplateCreated(true)
      // setTemplateUpdated(false)
      history.push({
        pathname: `/exam-templates/${id}`,
        state: { isCreating: false }
      })
    }
    if (result.updateExamTemplate) {
      const { courseId } = result.updateExamTemplate

      setEditableCourse(false)
      setInitialValues({ ...initialValues, courseId: courseId })
      // setTemplateCreated(false)
      // setTemplateUpdated(true)
    }
    if (result.resetExamTemplate) {
      const { courseId, ...rest } = initialValues
      setInitialValues({ ...rest })
      // setTemplateCreated(false)
      // setTemplateUpdated(false)
    }
    setErrors()
  }

  const onFetchExamTemplateSuccess = (result) => {
    if (!result) return
    const template = { ...result.getExamTemplate }
    setInitialValues(template)
    setFilters({
      selectedCourse: template.courseId
    })

    setEditableCourse(!template.courseId)
  }

  const onFetchCoursesSuccess = (result) => {
    if (!result) return
    setCourses(result.listCourses.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setErrors(translatableErrors)
  }

  // Button handlers
  const onSubmit = (values) => {
    const { name, courseId } = values

    isCreating
      ? createExamTemplate({
          variables: { name: name, courseId: courseId },
          update: (cache, result) => {
            syncCacheOnCreate(cache, result.data.createExamTemplate)
          }
        })
      : updateExamTemplate({
        variables: { id: params.id, name: name, courseId: courseId },
        update: (cache, result) => {
          syncCacheOnUpdate(cache, result.data.updateExamTemplate)
        }
      })
  }

  const onCancelEditClicked = () => {
    if (resetting) return
    setEditConfirmModalIsOpen(!editConfirmModalIsOpen)
  }

  const onConfirmEditClicked = () => {
    resetExamTemplate({
      variables: { id: params.id },
      update: (cache, result) => {
        const variables = { id: params.id }
        syncCacheOnResetTemplateExercises(cache, result.data.resetExamTemplate, variables)
      }
    })

    // Reset States to initial values
    setErrors()
    // setTemplateUpdated(false)
    setEditableCourse(true)
    setEditConfirmModalIsOpen(false)

    // Remove selected course from States
    const { courseId, ...restInitialValues } = initialValues
    setInitialValues(restInitialValues)
    const { selectedCourse, ...restFilters } = filters
    setFilters(restFilters)
  }

  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.name) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    return errors
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_EXAM_TEMPLATE,
    {
      variables: { id: params.id },
      skip: isCreating,
      fetchPolicy: 'network-only',
      onCompleted: onFetchExamTemplateSuccess,
      onError
    }
  )
  const { loading: fetchingCourses } = useQuery(
    LIST_COURSES,
    {
      variables: {},
      onCompleted: onFetchCoursesSuccess,
      onError
    }
  )
  const [createExamTemplate, { loading: creating }] = useMutation(CREATE_EXAM_TEMPLATE, { onCompleted: onSuccess, onError })
  const [updateExamTemplate, { loading: updating }] = useMutation(UPDATE_EXAM_TEMPLATE, { onCompleted: onSuccess, onError })
  const [resetExamTemplate, { loading: resetting }] = useMutation(RESET_EXAM_TEMPLATE, { onCompleted: onSuccess, onError })

  useEffect(() => {
    // State cleanup in case user was editing and now wants to create
    if (isCreating) {
      setInitialValues({})
      setEditableCourse(true)
      setFilters({ selectedCourse: '' })
    }
  }, [isCreating])

  return (
    <div className='exams-template-editor' style={{ width: 850 + 'px' }}>
      <div className='exam-template border shadow p-3 mb-3 bg-white rounded d-block'>
        <Form
          onSubmit={onSubmit}
          validate={validateBeforeSubmit}
          initialValues={initialValues}
          render={({ handleSubmit, pristine }) => (
            <form onSubmit={handleSubmit}>
              <TranslatableTitle isCreating={isCreating} entityName='exam_template' />

              <div className='row mb-4'>
                <div className='col-md-12 col-xs-12'>
                  <div className={isCreating ? 'row d-flex justify-content-center' : 'row'}>
                    <div className='col-md-10 col-xs-12'>
                      <span className='text-left pl-1 pb-1'>
                        <FormattedMessage id='common_entity.course' />
                      </span>
                      <SelectWrapper
                        fieldName='courseId'
                        isDisabled={fetchingCourses || !editableCourse}
                        options={courses}
                        validations={required}
                        selectedValue={filters.selectedCourse}
                        handleOnChange={(option) => {
                          setFilters({ ...filters, selectedCourse: option.value })
                        }}
                      />
                    </div>
                    {!isCreating &&
                      <div className='col-md-2 col-xs-12 text-right mt-4'>
                        <Button
                          type='button'
                          color='info'
                          disabled={creating || updating || fetching || resetting || fetchingCourses}
                          onClick={() => {
                            setEditConfirmModalIsOpen(true)
                          }}
                        >
                          <FormattedMessage id='button.edit' />
                        </Button>
                        <div id='edit-confirm-modal'>
                          <ModalWrapper
                            modalIsOpen={editConfirmModalIsOpen}
                            headerTextId='common_title.edit_confirmation'
                            bodyTextId='exercises_edit_course'
                            buttonTextId='button.confirm'
                            buttonColor='danger'
                            onCloseClick={() => onCancelEditClicked()}
                            onConfirmClick={() => onConfirmEditClicked()}
                          />
                        </div>
                      </div>}
                  </div>
                </div>
              </div>

              <div className='row'>
                <div className='col-md-12 col-xs-12'>
                  <span className='text-left pl-1 pb-1'>
                    <FormattedMessage id='exam_template_name' />
                  </span>
                  <FieldWrapper fieldName='name' validations={required} placeHolder={formatMessage({ id: 'exam_template_name' })} />
                </div>
              </div>

              <div id='buttons' className='d-flex justify-content-center'>
                <ButtonSubmit
                  isDisabled={creating || updating || fetchingCourses || pristine}
                  isLoading={creating || updating}
                />
                <ButtonGoTo
                  path='/exam-templates/list'
                  color='secondary'
                  translatableTextId='button.go_to_list'
                  isDisabled={creating || updating || fetching || fetchingCourses}
                />
              </div>

              <div id='info' className='d-flex justify-content-around mt-3'>
                {errors && <TranslatableErrors errors={errors} className='ml-3' />}
              </div>

            </form>
          )}
        />
      </div>
      {/* Exercises list editor */}
      {!isCreating && initialValues.courseId && !fetching && !fetchingCourses && <ExamTemplateExercises examTemplateId={params.id} courseId={initialValues.courseId} />}
    </div>
  )
}

export default injectIntl(ExamTemplatesEditor)
