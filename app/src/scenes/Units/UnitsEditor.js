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
import { CREATE_UNIT, UPDATE_UNIT, GET_UNIT } from '../../common/requests/units'
import { LIST_COURSES } from '../../common/requests/courses'
import { syncCacheOnCreate, syncCacheOnUpdate } from './cacheHelpers'

const UnitsEditor = (props) => {
  // Props and params
  const { isCreating, intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()
  const history = useHistory()

  // State
  const [unitCreated, setUnitCreated] = useState(false)
  const [unitUpdated, setUnitUpdated] = useState(false)
  const [courses, setCourses] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [selectedCourse, setSelectedCourse] = useState({})
  const [errors, setErrors] = useState()

  // Handlers
  const onSuccess = (result) => {
    const { id } = isCreating ? result.createUnit : result.updateUnit
    if (isCreating) {
      setUnitCreated(true)
      setUnitUpdated(false)
      history.push({
        pathname: `/units/${id}`,
        state: { isCreating: false }
      })
    } else {
      setUnitCreated(false)
      setUnitUpdated(true)
    }
    setErrors()
  }

  const onFetchUnitSuccess = (result) => {
    if (!result) return
    const unit = { ...result.getUnit }
    setInitialValues(unit)
    setSelectedCourse(unit.courseId)
  }

  const onFetchCoursesSuccess = (result) => {
    if (!result) return
    setCourses(result.listCourses.data)
  }

  const onError = (err) => {
    setUnitCreated(false)
    setUnitUpdated(false)

    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)

    setErrors(translatableErrors)
  }

  const onSubmit = (values) => {
    const { name, courseId } = values
    isCreating
      ? createUnit({
        variables: { name: name, courseId: courseId },
        update: (cache, result) => {
          syncCacheOnCreate(cache, result.data.createUnit)
        }
      })
      : updateUnit({
        variables: { id: params.id, name: name, courseId: courseId },
        update: (cache, result) => {
          syncCacheOnUpdate(cache, result.data.updateUnit)
        }
      })
  }

  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.name) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.courseId) { errors.courseId = formatMessage({ id: 'common_field_error.required' }) }
    return errors
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_UNIT,
    {
      variables: { id: params.id },
      skip: isCreating,
      onCompleted: onFetchUnitSuccess,
      onError
    }
  )
  const { loading: fetchingCourses } = useQuery(
    LIST_COURSES,
    {
      variables: { q: '', offset: 0, limit: 100 },
      onCompleted: onFetchCoursesSuccess,
      onError
    }
  )
  const [createUnit, { loading: creating }] = useMutation(CREATE_UNIT, { onCompleted: onSuccess, onError })
  const [updateUnit, { loading: updating }] = useMutation(UPDATE_UNIT, { onCompleted: onSuccess, onError })

  useEffect(() => {
    // State cleanup in case user was editing and now wants to create
    if (isCreating) {
      setUnitUpdated(false)
      setInitialValues({})
      setSelectedCourse('')
    }
  }, [isCreating])

  return (
    <div className='unit-editor'>
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
                : `${formatMessage({ id: 'common_action.edit' })}`} {formatMessage({ id: 'common_entity.unit' }).toLowerCase()}
            </p>

            <div id='fields' className='mb-5'>
              <Field name='name' validate={required}>
                {({ input, meta }) => (
                  <div className='mb-4'>
                    <input
                      {...input}
                      className='form-control'
                      placeholder={formatMessage({ id: 'unit_name' })}
                    />
                    {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                  </div>
                )}
              </Field>
            </div>

            <div id='fields' className='mb-5'>
              {fetchingCourses && <input type='text' className='form-control' value={formatMessage({ id: 'common_message.loading' })} disabled readOnly />}
              {!fetchingCourses && (
                <Field name='courseId' component='select' disabled={fetchingCourses} options={courses} validate={required}>
                  {({ input, meta, options }) => {
                    return (
                      <div>
                        <Select
                          options={options}
                          selectClass='form-control'
                          selectedValue={selectedCourse}
                          onChange={(value) => {
                            setSelectedCourse(value)
                            input.onChange(value)
                          }}
                        />
                        {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                      </div>
                    )
                  }}
                </Field>
              )}
            </div>

            <div id='buttons' className='d-flex justify-content-center'>
              <Button
                color='primary'
                type='submit'
                className='m-2'
                disabled={creating || updating || fetching || fetchingCourses || pristine}
              >
                {formatMessage({ id: 'button.save' })}
                {(creating || updating || fetching) && <LoadingInline className='ml-3' />}
              </Button>
              <Link to='/units/list'>
                <Button
                  color='secondary'
                  type='submit'
                  className='m-2'
                  disabled={creating || updating || fetching || fetchingCourses}
                >
                  {formatMessage({ id: 'button.go_to_list' })}
                </Button>
              </Link>

            </div>

            <div id='info' className='d-flex justify-content-around mt-5'>
              {errors && <TranslatableErrors errors={errors} className='ml-3' />}
              {!creating && unitCreated && <CustomAlert messages={{ id: 'unit_created', message: formatMessage({ id: 'unit_created' }) }} color='success' />}
              {!updating && unitUpdated && <CustomAlert messages={{ id: 'unit_updated', message: formatMessage({ id: 'unit_updated' }) }} color='success' />}
            </div>

          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(UnitsEditor)
