import React, { useState, useEffect } from 'react'
import { Form } from 'react-final-form'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { CustomAlert, ButtonSubmit, ButtonGoTo, FieldWrapper, TranslatableTitle } from '../../components/common'
import { required } from '../../common/validators'
import { injectIntl, FormattedMessage } from 'react-intl'
import { CREATE_COURSE, UPDATE_COURSE, GET_COURSE } from '../../common/requests/courses'
import { syncCacheOnCreate, syncCacheOnUpdate } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'

const CourseEditor = (props) => {
  // Props and params
  const { isCreating, intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()
  const history = useHistory()

  // State
  const [courseCreated, setCourseCreated] = useState(false)
  const [courseUpdated, setCourseUpdated] = useState(false)
  const [initialValues, setInitialValues] = useState({})
  const [errors, setErrors] = useState()

  // Handlers
  const onSuccess = (result) => {
    const { id } = isCreating ? result.createCourse : result.updateCourse
    if (isCreating) {
      setCourseCreated(true)
      setCourseUpdated(false)
      history.push({
        pathname: `/courses/${id}`,
        state: { isCreating: false }
      })
    } else {
      setCourseCreated(false)
      setCourseUpdated(true)
    }
    setErrors()
  }

  const onError = (err) => {
    setCourseCreated(false)
    setCourseUpdated(false)

    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setErrors(translatableErrors)
  }

  const onSubmit = (values) => {
    const { name } = values

    isCreating
      ? createCourse({
        variables: { name: name },
        update: (cache, result) => {
          syncCacheOnCreate(cache, result.data.createCourse)
        }
      })
      : updateCourse({
        variables: { id: params.id, name: name },
        update: (cache, result) => {
          syncCacheOnUpdate(cache, result.data.updateCourse)
        }
      })
  }

  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.name) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    return errors
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_COURSE,
    {
      variables: { id: params.id },
      skip: isCreating,
      onCompleted: (data) => {
        if (!data) return
        const course = { ...data.getCourse }
        setInitialValues(course)
      },
      onError
    }
  )
  const [createCourse, { loading: creating }] = useMutation(CREATE_COURSE, { onCompleted: onSuccess, onError })
  const [updateCourse, { loading: updating }] = useMutation(UPDATE_COURSE, { onCompleted: onSuccess, onError })

  useEffect(() => {
    // State cleanup in case user was editing and now wants to create
    if (isCreating) {
      setCourseUpdated(false)
      setInitialValues({})
    }
  }, [isCreating])

  return (
    <div className='course-editor bg-light p-5' style={{ width: 850 + 'px' }}>
      <Form
        onSubmit={onSubmit}
        validate={validateBeforeSubmit}
        initialValues={initialValues}
        render={({ handleSubmit, pristine }) => (
          <form onSubmit={handleSubmit}>
            <TranslatableTitle isCreating={isCreating} entityName='course' />

            <div className='row'>
              <div className='col-md-12 col-xs-12'>
                <span className='text-left pl-1 pb-1'>
                  <FormattedMessage id='course_name' />
                </span>
                <FieldWrapper fieldName='name' validations={required} placeHolder={formatMessage({ id: 'course_name' })} />
              </div>
            </div>

            <div id='buttons' className='d-flex justify-content-center'>
              <ButtonSubmit
                isDisabled={creating || updating || fetching || pristine}
                isLoading={creating || updating || fetching}
              />
              <ButtonGoTo
                path='/courses/list'
                color='secondary'
                translatableTextId='button.go_to_list'
                isDisabled={creating || updating || fetching}
              />
            </div>

            <div id='info' className='d-flex justify-content-around mt-5'>
              {errors && <CustomAlert messages={errors} className='ml-3' />}
              {!creating && courseCreated && <CustomAlert messages={{ id: 'course_created', message: formatMessage({ id: 'course_created' }) }} color='success' />}
              {!updating && courseUpdated && <CustomAlert messages={{ id: 'course_updated', message: formatMessage({ id: 'course_updated' }) }} color='success' />}
            </div>

          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(CourseEditor)
