import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { Button } from 'reactstrap'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { LoadingInline, CustomAlert, FieldError } from '../../components/common'
import { ERROR_MESSAGES } from '../../common/constants'
import { required } from '../../common/validators'
import { useRouteMatch } from 'react-router-dom'
import { injectIntl } from 'react-intl'
import { translateFieldError } from '../../common/translations'
import { CREATE_COURSE, UPDATE_COURSE, GET_COURSE } from './requests'

const Course = (props) => {
  // Props and params
  const { isCreating, intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()

  // Default values
  const defaultValues = {
    name: ''
  }

  // State
  const [courseCreated, setCourseCreated] = useState(false)
  const [courseUpdated, setCourseUpdated] = useState(false)
  const [initialValues, setInitialValues] = useState(defaultValues)
  const [errors, setErrors] = useState()

  // Handlers
  const onSuccess = (result) => {
    const { name } = isCreating ? result.createCourse : result.updateCourse
    isCreating ? setCourseCreated(name) : setCourseUpdated(name)
    setErrors()
  }

  const onError = (err) => {
    setCourseCreated(false)
    setCourseUpdated(false)

    const { graphQLErrors } = err
    const translatedErrors = graphQLErrors.map(error => {
      const errorCode = ((error || {}).extensions || {}).code || ''
      switch (errorCode) {
        case ERROR_MESSAGES.DUPLICATED_ENTITY:
          return { id: errorCode, message: formatMessage({ id: 'common_error.duplicated_entity' }) }
        default:
          return { id: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, message: formatMessage({ id: 'common_error.internal_server_error' }) }
      }
    })
    setErrors(translatedErrors)
  }

  const onSubmit = (values) => {
    const { name } = values

    isCreating
      ? createCourse({ variables: { name: name } })
      : updateCourse({ variables: { id: params.id, name: name } })
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

  return (
    <div className='course-editor'>
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        render={({ handleSubmit, pristine }) => (
          <form
            onSubmit={handleSubmit}
            className='text-center bg-light p-5'
            style={{ minWidth: 400 + 'px' }}
          >
            <p className='h4 mb-5'>
              {isCreating ? `${formatMessage({ id: 'common_action.create' })}` : `${formatMessage({ id: 'common_action.edit' })}`} {formatMessage({ id: 'common_entity.course' }).toLowerCase()}
            </p>

            <div id='fields' className='mb-5'>
              <Field name='name' validate={required}>
                {({ input, meta }) => (
                  <div className='mb-4'>
                    <input
                      {...input}
                      className='form-control'
                      placeholder={formatMessage({ id: 'course_name' })}
                    />
                    {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                  </div>
                )}
              </Field>
            </div>

            <div id='buttons' className='d-flex justify-content-center'>
              <Button
                color='primary'
                type='submit'
                className='m-2'
                disabled={creating || updating || fetching || pristine}
              >
                {formatMessage({ id: 'button.save' })}
                {(creating || updating || fetching) && <LoadingInline className='ml-3' />}
              </Button>
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

export default injectIntl(Course)
