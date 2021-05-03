import React, { useState, useEffect } from 'react'
import { Form, Field } from 'react-final-form'
import { useRouteMatch } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { CustomAlert, ButtonSubmit, ButtonGoTo, FieldWrapper, TranslatableTitle } from '../../components/common'
import { required } from '../../common/validators'
import { injectIntl, FormattedMessage } from 'react-intl'
import { CREATE_ANSWER, UPDATE_ANSWER, GET_ANSWER } from '../../common/requests/answers'
import { syncAnswersCacheOnCreate, syncAnswersCacheOnUpdate } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'

const AnswersEditor = (props) => {
  // Props and params
  const { isCreating, intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()

  // State
  const [answerCreated, setAnswerCreated] = useState(false)
  const [answerUpdated, setAnswerUpdated] = useState(false)
  const [initialValues, setInitialValues] = useState({})
  const [errors, setErrors] = useState()

  // Handlers
  const onSuccess = (result) => {
    if (isCreating) {
      setAnswerCreated(true)
      setAnswerUpdated(false)
    } else {
      setAnswerCreated(false)
      setAnswerUpdated(true)
    }
    setErrors()
  }

  const onError = (err) => {
    setAnswerCreated(false)
    setAnswerUpdated(false)

    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setErrors(translatableErrors)
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
      setAnswerUpdated(false)
      setInitialValues({})
    }
  }, [isCreating])

  return (
    <div className='answer-editor bg-light p-5' style={{ width: 850 + 'px' }}>
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

            <hr />

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

            <div id='info' className='d-flex justify-content-around mt-5'>
              {errors && <CustomAlert messages={errors} className='ml-3' />}
              {!creating && answerCreated && <CustomAlert messages={{ id: 'answer_created', message: formatMessage({ id: 'answer_created' }) }} color='success' />}
              {!updating && answerUpdated && <CustomAlert messages={{ id: 'answer_updated', message: formatMessage({ id: 'answer_updated' }) }} color='success' />}
            </div>

          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(AnswersEditor)
