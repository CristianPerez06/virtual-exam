import React, { useState, useEffect } from 'react'
import { Form } from 'react-final-form'
import { Button, Input } from 'reactstrap'
import { Link, useHistory, useRouteMatch } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import {
  CustomAlert,
  TranslatableErrors,
  Table,
  DeleteModal,
  FieldWrapper,
  SelectWrapper,
  TranslatableTitle,
  ButtonSubmit,
  ButtonGoTo,
  NoResults
} from '../../components/common'
import { required } from '../../common/validators'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { injectIntl, FormattedMessage } from 'react-intl'
import { CREATE_EXERCISE, UPDATE_EXERCISE, GET_EXERCISE } from '../../common/requests/exercises'
import { LIST_COURSES } from '../../common/requests/courses'
import { LIST_UNITS } from '../../common/requests/units'
import { DISABLE_ANSWER, LIST_ANSWERS } from '../../common/requests/answers'
import { syncCacheOnCreate, syncCacheOnUpdate, syncAnswersCacheOnDelete } from './cacheHelpers'

const ExercisesEditor = (props) => {
  // Props and params
  const { isCreating, intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()
  const history = useHistory()

  // State
  const [exerciseCreated, setExerciseCreated] = useState(false)
  const [exerciseUpdated, setExerciseUpdated] = useState(false)
  const [courses, setCourses] = useState([])
  const [units, setUnits] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [filters, setFilters] = useState({})
  const [errors, setErrors] = useState()
  const [alerts, setAlerts] = useState()
  const [answers, setAnswers] = useState([])
  const [answerToDelete, setAnswerToDelete] = useState()
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
  const [answerDeleted, setAnswerDeleted] = useState(false)

  // Handlers
  const onSuccess = (result) => {
    const { id } = isCreating ? result.createExercise : result.updateExercise
    if (isCreating) {
      setExerciseCreated(true)
      setExerciseUpdated(false)
      history.push({
        pathname: `/exercises/${id}`,
        state: { isCreating: false }
      })
    } else {
      setExerciseCreated(false)
      setExerciseUpdated(true)
    }
    setErrors()
  }

  const onFetchExerciseSuccess = (result) => {
    if (!result) return
    const exercise = { ...result.getExercise }
    setInitialValues(exercise)
    setFilters({
      selectedCourse: exercise.courseId,
      selectedUnit: exercise.unitId
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
    setExerciseCreated(false)
    setExerciseUpdated(false)

    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)

    setErrors(translatableErrors)
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
        const alerts = getAlerts(updatedAnswersList.data)
        setAnswers(updatedAnswersList.data)
        setAlerts(alerts)
      }
    })
  }

  // Other
  const stateCleanupOnDelete = () => {
    setErrors()
    setDeleteModalIsOpen(false)
    setAnswerDeleted(true)
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
        const alerts = getAlerts(answers.data)
        setAnswers(answers.data)
        setAlerts(alerts)
      },
      onError
    }
  )
  const [createExercise, { loading: creating }] = useMutation(CREATE_EXERCISE, { onCompleted: onSuccess, onError })
  const [updateExercise, { loading: updating }] = useMutation(UPDATE_EXERCISE, { onCompleted: onSuccess, onError })
  const [disableAnswer, { loading: deletingAnswer }] = useMutation(DISABLE_ANSWER, { onCompleted: stateCleanupOnDelete, onError })

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
      setExerciseUpdated(false)
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

              {/* Delete answer modal */}
              <div id='delete-modal'>
                <DeleteModal
                  modalIsOpen={deleteModalIsOpen}
                  isBussy={deletingAnswer}
                  onCloseClick={() => onCancelClicked()}
                  onDeleteClick={() => onDeleteConfirmClicked()}
                />
              </div>

              {/* Buttons */}
              <div id='buttons' className='d-flex justify-content-center'>
                <ButtonSubmit
                  isDisabled={creating || updating || fetching || fetchingCourses || fetchingUnits || pristine}
                  isLoading={creating || updating || fetching}
                />

                {!isCreating && (
                  <ButtonGoTo
                    path={`/exercises/${params.id}/answers/new`}
                    color='info'
                    translatableTextId='button.add_answer'
                    isDisabled={creating || updating || fetching || fetchingCourses || fetchingUnits}
                  />
                )}

                <ButtonGoTo
                  path='/exercises/list'
                  color='secondary'
                  translatableTextId='button.go_to_list'
                  isDisabled={creating || updating || fetching || fetchingCourses || fetchingUnits}
                />
              </div>

              {/* Info */}
              {(errors || exerciseCreated || exerciseUpdated || answerDeleted) && (
                <div id='info' className='d-flex justify-content-around mt-4'>
                  {errors && <TranslatableErrors errors={errors} className='ml-3' />}
                  {!creating && exerciseCreated && <CustomAlert messages={{ id: 'unit_created', message: formatMessage({ id: 'exercise_created' }) }} color='success' />}
                  {!updating && exerciseUpdated && <CustomAlert messages={{ id: 'unit_updated', message: formatMessage({ id: 'exercise_updated' }) }} color='success' />}
                  {!deletingAnswer && answerDeleted && <CustomAlert messages={{ id: 'answer_deleted', message: `${formatMessage({ id: 'answer_deleted' })}: ${answerToDelete.name}` }} color='success' />}
                </div>
              )}

            </form>
          )}
        />
      </div>
      {/* Answers */}
      {!fetchingAnswers && (
        <div className='answers-list border shadow p-3 mb-3 bg-white rounded'>
          <p className='text-center h5 mb-0'>
            <FormattedMessage id='common_entity.answers' />
          </p>
          {answers.length === 0
            ? <NoResults />
            : <Table columns={columns} data={answers} />}
          {alerts && <CustomAlert messages={alerts} color='warning' />}
        </div>
      )}
    </div>
  )
}

export default injectIntl(ExercisesEditor)
