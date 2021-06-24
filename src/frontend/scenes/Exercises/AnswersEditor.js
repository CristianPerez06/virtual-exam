import React, { useState, useEffect } from 'react'
import { Form, Field } from 'react-final-form'
import { useRouteMatch } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { ButtonSubmit, ButtonGoTo, FieldWrapper, TranslatableTitle } from '../../components/common'
import { required } from '../../common/validators'
import { injectIntl, FormattedMessage } from 'react-intl'
import { CREATE_ANSWER, UPDATE_ANSWER, GET_ANSWER } from '../../common/requests/answers'
import { syncAnswersCacheOnCreate, syncAnswersCacheOnUpdate } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { useAlert } from '../../hooks'

const AnswersEditor = (props) => {
  // Props and params
  const { isCreating, intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()

  // State
  const [initialValues, setInitialValues] = useState({})

  // Hooks
  const { alertSuccess, alertError } = useAlert()

  // Handlers
  const onSuccess = (result) => {
    if (isCreating) {
      alertSuccess(formatMessage({ id: 'answer_created' }))
    } else {
      alertSuccess(formatMessage({ id: 'answer_updated' }))
    }
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
  }

  const onSubmit = (values) => {
    const { name, description, correct = false } = values

    isCreating
      ? createAnswer({
          variables: { name, description, correct, exerciseId: params.exerciseId },
          update: (cache, result) => {
            const variables = { exerciseId: params.exerciseId }
            syncAnswersCacheOnCreate(cache, result.data.createAnswer, variables)
          }
        })
      : updateAnswer({
        variables: { id: params.answerId, name, description, correct, exerciseId: params.exerciseId },
        update: (cache, result) => {
          const variables = { exerciseId: params.exerciseId }
          syncAnswersCacheOnUpdate(cache, result.data.updateAnswer, variables)
        }
      })
  }

  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.name) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.description) { errors.description = formatMessage({ id: 'common_field_error.required' }) }
    return errors
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_ANSWER,
    {
      variables: { id: params.answerId },
      skip: isCreating,
      onCompleted: (data) => {
        if (!data) return
        const answer = { ...data.getAnswer }
        setInitialValues(answer)
      },
      onError
    }
  )
  const [createAnswer, { loading: creating }] = useMutation(CREATE_ANSWER, { onCompleted: onSuccess, onError })
  const [updateAnswer, { loading: updating }] = useMutation(UPDATE_ANSWER, { onCompleted: onSuccess, onError })

  useEffect(() => {
    // State cleanup in case user was editing and now wants to create
    if (isCreating) {
      setInitialValues({})
    }
  }, [isCreating])

  return (
    <div className='answer-editor border shadow p-3 mb-3 bg-white rounded' style={{ width: 850 + 'px' }}>
      <Form
        onSubmit={onSubmit}
        validate={validateBeforeSubmit}
        initialValues={initialValues}
        render={({ handleSubmit, pristine }) => (
          <form onSubmit={handleSubmit}>
            <TranslatableTitle isCreating={isCreating} entityName='answer' />

            <div className='row'>
              <div className='col-md-12 col-xs-12'>
                <span className='text-left pl-1 pb-1'>
                  <FormattedMessage id='answer_name' />
                </span>
                <FieldWrapper fieldName='name' validations={required} placeHolder={formatMessage({ id: 'answer_name' })} />
              </div>
            </div>

            <div className='row'>
              <div className='col-md-12 col-xs-12'>
                <span className='text-left pl-1 pb-1'>
                  <FormattedMessage id='answer_description' />
                </span>
                <FieldWrapper fieldName='description' validations={required} placeHolder={formatMessage({ id: 'answer_description' })} />
              </div>
            </div>

            <div className='row'>
              <div className='col-md-12 col-xs-12'>
                <span className='text-left pl-1 pb-1'>
                  <FormattedMessage id='answer_correct' />
                </span>
                <Field className='ml-2' name='correct' component='input' type='checkbox' />
              </div>
            </div>

            <div id='buttons' className='d-flex justify-content-center'>
              <ButtonSubmit
                isDisabled={creating || updating || fetching || pristine}
                isLoading={creating || updating || fetching}
              />
              <ButtonGoTo
                path={`/exercises/${params.exerciseId}`}
                color='secondary'
                translatableTextId='button.go_to_exercise'
                isDisabled={creating || updating || fetching}
              />
            </div>

          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(AnswersEditor)
