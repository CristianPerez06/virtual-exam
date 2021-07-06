import React, { useState, useEffect } from 'react'
import { Form } from 'react-final-form'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { ButtonSubmit, ButtonGoTo, FieldWrapper, TranslatableTitle } from '../../components/common'
import { required } from '../../common/validators'
import { injectIntl, FormattedMessage } from 'react-intl'
import { CREATE_COURSE, UPDATE_COURSE, GET_COURSE } from '../../common/requests/courses'
import { syncCacheOnCreate, syncCacheOnUpdate } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { useAlert } from '../../hooks'

const CourseEditor = (props) => {
  // Props and params
  const { isCreating, intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()
  const history = useHistory()

  // Hooks
  const { alertSuccess, alertError } = useAlert()

  // State
  const [initialValues, setInitialValues] = useState({})

  // Handlers
  const onSuccess = (result) => {
    const { id } = isCreating ? result.createCourse : result.updateCourse
    if (isCreating) {
      alertSuccess(formatMessage({ id: 'course_created' }))
      history.push({ pathname: `/courses/${id}`, state: { isCreating: false } })
    } else {
      alertSuccess(formatMessage({ id: 'course_updated' }))
    }
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
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
      setInitialValues({})
    }
  }, [isCreating])

  return (
    <div className='course-editor border shadow p-3 mb-3 bg-white rounded'>
      <Form
        onSubmit={onSubmit}
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

            <div id='buttons' className='d-flex justify-content-end'>
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
          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(CourseEditor)
