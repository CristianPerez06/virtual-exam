import React, { useState, useEffect } from 'react'
import { Form } from 'react-final-form'
import { Button, Input } from 'reactstrap'
import { Link, useHistory, useRouteMatch } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import {
  Table,
  DeleteModal,
  FieldWrapper,
  SelectWrapper,
  TranslatableTitle,
  ButtonSubmit,
  ButtonGoTo,
  NoResults,
  LoadingInline,
  ImageUploader
} from '../../components/common'
import ExerciseDescription from './components/ExerciseDescription'
import { required } from '../../common/validators'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { injectIntl, FormattedMessage } from 'react-intl'
import { CREATE_EXERCISE, UPDATE_EXERCISE, GET_EXERCISE, UPDATE_EXERCISE_DESCRIPTION_URL } from '../../common/requests/exercises'
import { LIST_COURSES } from '../../common/requests/courses'
import { LIST_UNITS } from '../../common/requests/units'
import { DISABLE_ANSWER, LIST_ANSWERS } from '../../common/requests/answers'
import { syncCacheOnCreate, syncCacheOnUpdate, syncAnswersCacheOnDelete } from './cacheHelpers'
import { useAlert } from '../../hooks'

const ExercisesEditor = (props) => {
  // Props and params
  const { isCreating, intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()
  const history = useHistory()

  // Hooks
  const { alertSuccess, alertError, alertWarning } = useAlert()

  // State
  const [exercise, setExercise] = useState(false)
  const [courses, setCourses] = useState([])
  const [units, setUnits] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [filters, setFilters] = useState({})
  const [answers, setAnswers] = useState([])
  const [answerToDelete, setAnswerToDelete] = useState()
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(true)
  const [descriptionImage, setDescriptionImage] = useState(true)

  // Handlers
  const onSuccess = (result) => {
    const { id } = isCreating ? result.createExercise : result.updateExercise
    if (isCreating) {
      alertSuccess(formatMessage({ id: 'exercise_created' }))
      history.push({ pathname: `/exercises/${id}`, state: { isCreating: false } })
    } else {
      alertSuccess(formatMessage({ id: 'exercise_updated' }))
    }
  }

  const onFetchExerciseSuccess = (result) => {
    if (!result) return
    const ex = { ...result.getExercise }
    setExercise(ex)
    setInitialValues(ex)
    if (ex.descriptionUrl) {
      setDescriptionImage(ex.descriptionUrl)
      setShowImageUploader(false)
    }
    setFilters({
      selectedCourse: ex.courseId,
      selectedUnit: ex.unitId
    })
  }

  const onFetchCoursesSuccess = (result) => {
    if (!result) return
    setCourses(result.listCourses.data)
  }

  const onFetchUnitsSuccess = (result) => {
    if (!result) return
    setUnits(result.listUnits.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
  }

  const onSubmit = (values) => {
    const { name, courseId, unitId } = values
    isCreating
      ? createExercise({
          variables: { name: name, courseId: courseId, unitId: unitId },
          update: (cache, result) => {
            const variables = { courseId: courseId, unitId: unitId }
            syncCacheOnCreate(cache, result.data.createExercise, variables)
          }
        })
      : updateExercise({
        variables: { id: params.id, name: name, courseId: courseId, unitId: unitId },
        update: (cache, result) => {
          const variables = { courseId: courseId, unitId: unitId }
          syncCacheOnUpdate(cache, result.data.updateExercise, variables, variables)
        }
      })
  }

  const onUploadComplete = (fileUrl) => {
    updateExerciseDescriptionUrl({
      variables: { id: params.id, descriptionUrl: fileUrl },
      update: (cache, result) => {
        setShowImageUploader(false)
        setDescriptionImage(fileUrl)
      }
    })
  }

  const getAlerts = (answersList) => {
    if (answersList.length <= 1) {
      const moreAnswersNeeded = { id: 'exercise_at_least_two_answers_needed' }
      return moreAnswersNeeded
    }
    if (answersList.every(answer => answer.correct === false)) {
      const correctAnswerNeeded = { id: 'exercise_answer_correct_needed' }
      return correctAnswerNeeded
    }
  }

  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.name) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.courseId) { errors.courseId = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.unitId) { errors.unitId = formatMessage({ id: 'common_field_error.required' }) }
    return errors
  }

  // Button handlers
  const onDeleteClicked = (course) => {
    setAnswerToDelete(course)
    setDeleteModalIsOpen(true)
  }

  const onCancelClicked = () => {
    if (deletingAnswer) return
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  const onDeleteConfirmClicked = () => {
    disableAnswer({
      variables: { id: answerToDelete.id },
      update: (cache, result) => {
        const updatedAnswersList = syncAnswersCacheOnDelete(cache, answerToDelete, { exerciseId: params.id })
        setAnswers(updatedAnswersList.data)

        alertSuccess(formatMessage({ id: 'answer_deleted' }))

        const alert = getAlerts(updatedAnswersList.data)
        if (!alert) return
        alertWarning(formatMessage({ id: alert.id }))
      }
    })
  }

  const onUpdateImageClicked = () => {
    setShowImageUploader(true)
  }

  const onCancelSelectImageClick = () => {
    setShowImageUploader(false)
  }

  // Other
  const stateCleanupOnDelete = () => {
    setDeleteModalIsOpen(false)
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
  const { loading: fetchingUnits } = useQuery(
    LIST_UNITS,
    {
      variables: { courseId: filters.selectedCourse },
      skip: !filters.selectedCourse,
      onCompleted: onFetchUnitsSuccess,
      onError
    }
  )
  const { loading: fetching } = useQuery(
    GET_EXERCISE,
    {
      variables: { id: params.id },
      skip: isCreating,
      onCompleted: onFetchExerciseSuccess,
      onError
    }
  )
  const { loading: fetchingAnswers } = useQuery(
    LIST_ANSWERS,
    {
      variables: { exerciseId: params.id },
      skip: isCreating,
      onCompleted: (data) => {
        if (!data) return

        const answers = { ...data.listAnswers }
        setAnswers(answers.data)

        const alert = getAlerts(answers.data)
        if (!alert) return
        alertWarning(formatMessage({ id: alert.id }))
      },
      onError
    }
  )
  const [createExercise, { loading: creating }] = useMutation(CREATE_EXERCISE, { onCompleted: onSuccess, onError })
  const [updateExercise, { loading: updating }] = useMutation(UPDATE_EXERCISE, { onCompleted: onSuccess, onError })
  const [disableAnswer, { loading: deletingAnswer }] = useMutation(DISABLE_ANSWER, { onCompleted: stateCleanupOnDelete, onError })
  const [updateExerciseDescriptionUrl, { loading: updatingDescription }] = useMutation(UPDATE_EXERCISE_DESCRIPTION_URL, { onCompleted: stateCleanupOnDelete, onError })

  const columnTranslations = {
    answerName: formatMessage({ id: 'answer_name' }),
    answerCorrect: formatMessage({ id: 'answer_correct' }),
    action: formatMessage({ id: 'action' }),
    edit: formatMessage({ id: 'button.edit' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columns = React.useMemo(
    () => {
      return [{
        Header: columnTranslations.answerName,
        accessor: 'name',
        Cell: ({ row }) => row.values.name
      },
      {
        Header: columnTranslations.answerCorrect,
        accessor: 'correct',
        Cell: ({ row }) => {
          return <Input type='checkbox' className='position-relative m-0 p-0' checked={row.values.correct} readOnly disabled />
        }
      },
      {
        Header: columnTranslations.action,
        Cell: ({ row }) => (
          <div className='d-flex justify-content-center'>
            <Link to={`/exercises/${row.original.exerciseId}/answers/${row.original.id}`}>
              <Button color='info'>{columnTranslations.edit}</Button>
            </Link>
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

  useEffect(() => {
    // State cleanup in case user was editing and now wants to create
    if (isCreating) {
      // setExerciseUpdated(false)
      setInitialValues({})
      setFilters({ selectedCourse: '', selectedUnit: '' })
    }
  }, [isCreating])

  return (
    <div className='exercise-editor' style={{ width: 850 + 'px' }}>
      <div className='exercise-data border shadow p-3 mb-3 bg-white rounded d-block'>
        <Form
          onSubmit={onSubmit}
          validate={validateBeforeSubmit}
          initialValues={initialValues}
          render={({ handleSubmit, pristine }) => (
            <form onSubmit={handleSubmit}>
              <TranslatableTitle isCreating={isCreating} entityName='exercise' />

              {/* Course - Unit */}
              <div className='row mb-4'>
                <div className='col-md-6 col-xs-12'>
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
                <div className='col-md-6 col-xs-12'>
                  <span className='text-left pl-1 pb-1'>
                    <FormattedMessage id='common_entity.unit' />
                  </span>
                  <SelectWrapper
                    fieldName='unitId'
                    isDisabled={!filters.selectedCourse || fetchingCourses}
                    options={units}
                    validations={required}
                    selectedValue={filters.selectedUnit}
                    handleOnChange={(option) => {
                      setFilters({ ...filters, selectedUnit: option.value })
                    }}
                  />
                </div>
              </div>

              {/* Name */}
              <div className='row'>
                <div className='col-md-12 col-xs-12'>
                  <span className='text-left pl-1 pb-1'>
                    <FormattedMessage id='exercise_name' />
                  </span>
                  <FieldWrapper fieldName='name' validations={required} placeHolder={formatMessage({ id: 'exercise_name' })} />
                </div>
              </div>

              {/* Description */}
              <div className='row'>
                <div className='col-md-12 col-xs-12'>
                  <span className='text-left pl-1 pb-1'>
                    <FormattedMessage id='exercise_description' />
                  </span>
                  <FieldWrapper fieldName='description' placeHolder={formatMessage({ id: 'exercise_description' })} />
                </div>
              </div>

              {/* Visual Description */}
              {!fetching && !isCreating && (
                <div className='row'>
                  <div className='col-md-12 col-xs-12'>
                    <span className='text-left pl-1 pb-1'>
                      <FormattedMessage id='exercise_visual_description' />
                    </span>
                    {showImageUploader
                      ? (
                        <ImageUploader
                          id={params.id}
                          disabled={false}
                          onUploadSuccess={onUploadComplete}
                          oldImage={exercise.descriptionUrl}
                          onCancelClick={onCancelSelectImageClick}
                        />)
                      : <ExerciseDescription url={descriptionImage} onChangeClicked={onUpdateImageClicked} />}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className='d-flex justify-content-between mt-4'>
                <div id='button-add-answer'>
                  {!isCreating && (
                    <ButtonGoTo
                      path={`/exercises/${params.id}/answers/new`}
                      color='info'
                      translatableTextId='button.add_answer'
                      isDisabled={creating || updating || updatingDescription || fetching || fetchingCourses || fetchingUnits}
                    />
                  )}
                </div>

                <div id='buttons'>
                  <ButtonSubmit
                    isDisabled={creating || updating || updatingDescription || fetching || fetchingCourses || fetchingUnits || pristine}
                    isLoading={creating || updating || updatingDescription || fetching}
                  />
                  <ButtonGoTo
                    path='/exercises/list'
                    color='secondary'
                    translatableTextId='button.go_to_list'
                    isDisabled={creating || updating || updatingDescription || fetching || fetchingCourses || fetchingUnits}
                  />
                </div>
              </div>

            </form>
          )}
        />
      </div>

      {/* Delete answer modal */}
      <div id='delete-modal'>
        <DeleteModal
          modalIsOpen={deleteModalIsOpen}
          isBussy={deletingAnswer}
          onCloseClick={() => onCancelClicked()}
          onDeleteClick={() => onDeleteConfirmClicked()}
        />
      </div>

      {/* Answers */}
      <div className='answers-list border shadow p-3 mb-3 bg-white rounded'>
        <p className='text-center h5 mb-0'>
          <FormattedMessage id='common_entity.answers' />
        </p>
        {fetchingAnswers && <div className='text-center'><LoadingInline color='grey' /></div>}
        {!fetchingAnswers && answers.length === 0 && <NoResults />}
        {!fetchingAnswers && answers.length !== 0 && <Table columns={columns} data={answers} />}
      </div>

    </div>
  )
}

export default injectIntl(ExercisesEditor)
