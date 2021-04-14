import React, { useState, useEffect } from 'react'
import { Form, Field } from 'react-final-form'
import { Button } from 'reactstrap'
import { useHistory, Link, useRouteMatch } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { LoadingInline, CustomAlert, TranslatableErrors, FieldError, Select } from '../../components/common'
import { required } from '../../common/validators'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { injectIntl } from 'react-intl'
import { translateFieldError } from '../../common/translations'
import { CREATE_EXERCISE, UPDATE_EXERCISE, GET_EXERCISE } from '../../common/requests/exercises'
import { LIST_COURSES } from '../../common/requests/courses'
import { LIST_UNITS } from '../../common/requests/units'
import { syncCacheOnCreate, syncCacheOnUpdate } from './cacheHelpers'

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
          syncCacheOnCreate(cache, result.data.createExercise)
        }
      })
      : updateExercise({
        variables: { id: params.id, name: name, courseId: courseId, unitId: unitId },
        update: (cache, result) => {
          syncCacheOnUpdate(cache, result.data.updateExercise)
        }
      })
  }

  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.name) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.courseId) { errors.courseId = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.unitId) { errors.unitId = formatMessage({ id: 'common_field_error.required' }) }
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
  const [createExercise, { loading: creating }] = useMutation(CREATE_EXERCISE, { onCompleted: onSuccess, onError })
  const [updateExercise, { loading: updating }] = useMutation(UPDATE_EXERCISE, { onCompleted: onSuccess, onError })

  useEffect(() => {
    // State cleanup in case user was editing and now wants to create
    if (isCreating) {
      setExerciseUpdated(false)
      setInitialValues({})
      setFilters({})
    }
  }, [isCreating])

  return (
    <div className='exercise-editor'>
      <Form
        onSubmit={onSubmit}
        validate={validateBeforeSubmit}
        initialValues={initialValues}
        render={({ handleSubmit, pristine }) => (
          <form
            onSubmit={handleSubmit}
            className='text-center bg-light p-5'
            style={{ maxWidth: 600 + 'px' }}
          >
            <p className='h4 mb-5'>
              {isCreating
                ? `${formatMessage({ id: 'common_action.create' })}`
                : `${formatMessage({ id: 'common_action.edit' })}`} {formatMessage({ id: 'common_entity.exercise' }).toLowerCase()}
            </p>

            <div id='fields' className='mb-5'>
              <Field name='name' validate={required}>
                {({ input, meta }) => (
                  <div className='mb-4'>
                    <input
                      {...input}
                      className='form-control'
                      placeholder={formatMessage({ id: 'exercise_name' })}
                    />
                    {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                  </div>
                )}
              </Field>
            </div>

            <div id='fields' className='mb-5'>
              <Field name='courseId' component='select' options={courses} validate={required}>
                {({ input, meta, options }) => {
                  return (
                    <div>
                      <Select
                        options={options}
                        selectClass='form-control'
                        selectedValue={filters.selectedCourse}
                        onChange={(value) => {
                          setFilters({ ...filters, selectedCourse: value })
                          input.onChange(value)
                        }}
                        isDisabled={fetchingCourses}
                      />
                      {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                    </div>
                  )
                }}
              </Field>
            </div>

            <div id='fields' className='mb-5'>
              <Field name='unitId' component='select' options={units} validate={required}>
                {({ input, meta, options }) => {
                  return (
                    <div>
                      <Select
                        options={options}
                        selectClass='form-control'
                        selectedValue={filters.selectedUnit}
                        onChange={(value) => {
                          setFilters({ ...filters, selectedUnit: value })
                          input.onChange(value)
                        }}
                        isDisabled={!filters.selectedCourse || fetchingCourses}
                      />
                      {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                    </div>
                  )
                }}
              </Field>
            </div>

            <div id='buttons' className='d-flex justify-content-center'>
              <Button
                color='primary'
                type='submit'
                className='m-2'
                disabled={creating || updating || fetching || fetchingCourses || fetchingUnits || pristine}
              >
                {formatMessage({ id: 'button.save' })}
                {(creating || updating || fetching) && <LoadingInline className='ml-3' />}
              </Button>
              <Link to='/exercises/list'>
                <Button
                  color='secondary'
                  type='submit'
                  className='m-2'
                  disabled={creating || updating || fetching || fetchingCourses || fetchingUnits}
                >
                  {formatMessage({ id: 'button.go_to_list' })}
                </Button>
              </Link>
            </div>

            <div id='info' className='d-flex justify-content-around mt-5'>
              {errors && <TranslatableErrors errors={errors} className='ml-3' />}
              {!creating && exerciseCreated && <CustomAlert messages={{ id: 'unit_created', message: formatMessage({ id: 'exercise_created' }) }} color='success' />}
              {!updating && exerciseUpdated && <CustomAlert messages={{ id: 'unit_updated', message: formatMessage({ id: 'exercise_updated' }) }} color='success' />}
            </div>

          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(ExercisesEditor)
