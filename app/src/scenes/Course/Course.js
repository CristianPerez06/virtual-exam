import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { Button } from 'reactstrap'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { LoadingInline, CustomAlert, FieldError } from '../../components/common'
import { required } from '../../common/validators'
import { useRouteMatch } from 'react-router-dom'
import { CREATE_COURSE, UPDATE_COURSE, GET_COURSE } from './requests'

const Course = (props) => {
  // Props and params
  const { isCreating } = props
  const { params } = useRouteMatch()

  // Default values
  const defaultValues = {
    name: ''
  }

  // State
  const [courseCreated, setCourseCreated] = useState()
  const [courseUpdated, setCourseUpdated] = useState()
  const [initialValues, setInitialValues] = useState(defaultValues)
  const [errors, setErrors] = useState()

  // Handlers
  const onSuccess = (result) => {
    const { name } = isCreating ? result.createCourse : result.updateCourse
    isCreating ? setCourseCreated(name) : setCourseUpdated(name)
    setErrors()
  }

  const onError = (err) => {
    setCourseCreated()
    setCourseUpdated()
    setErrors(err.graphQLErrors)
  }

  const onSubmit = (values) => {
    const { name } = values

    try {
      isCreating
        ? createCourse({ variables: { name: name } })
        : updateCourse({ variables: { id: params.id, name: name } })
    } catch (e) {
      // show the error
      setErrors(e)
    }
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
    <div className='Course'>
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
              {isCreating ? 'Create' : 'Update'} course
            </p>

            <div id='fields' className='mb-5'>
              <Field name='name' validate={required}>
                {({ input, meta }) => (
                  <div className='mb-4'>
                    <input
                      {...input}
                      className='form-control'
                      placeholder='Course name'
                    />
                    {meta.error && meta.touched && <FieldError error={meta.error} />}
                  </div>
                )}
              </Field>
            </div>

            <div id='buttons' className='d-flex justify-content-around'>
              <Button
                color='primary'
                disabled={creating || updating || fetching || pristine}
              >
                {isCreating ? 'Create' : 'Update'}
                {(creating || updating || fetching) && <LoadingInline className='ml-3' />}
              </Button>
            </div>

            <div id='info' className='d-flex justify-content-around mt-5'>
              {errors && <CustomAlert messages={errors} className='ml-3' />}
              {!creating && courseCreated && <CustomAlert message='Course created successfully' color='success' className='ml-3' />}
              {!updating && courseUpdated && <CustomAlert message='Course updated successfully' color='success' className='ml-3' />}
            </div>

          </form>
        )}
      />
    </div>
  )
}

export default Course
