import React, { useState, useEffect } from 'react'
import { Form, Field } from 'react-final-form'
import { useRouteMatch } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { ButtonSubmit, ButtonGoTo, FieldWrapper, TranslatableTitle, ImageUploader } from '../../components/common'
import VisualDescription from './components/VisualDescription'
import { required } from '../../common/validators'
import { injectIntl, FormattedMessage } from 'react-intl'
import { CREATE_ANSWER, UPDATE_ANSWER, UPDATE_ANSWER_DESCRIPTION_URL, GET_ANSWER } from '../../common/requests/answers'
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
  const [showImageUploader, setShowImageUploader] = useState(true)
  const [descriptionImage, setDescriptionImage] = useState(true)

  // Hooks
  const { alertSuccess, alertError } = useAlert()

  // Handlers
  const onFetchAnsewerSuccess = (data) => {
    if (!data) return
    const answer = { ...data.getAnswer }
    setInitialValues(answer)
    if (answer.descriptionUrl) {
      setDescriptionImage(answer.descriptionUrl)
      setShowImageUploader(false)
    }
  }

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

  const onUploadComplete = (fileUrl) => {
    updateAnswerDescriptionUrl({
      variables: { id: params.answerId, descriptionUrl: fileUrl },
      update: (cache, result) => {
        setShowImageUploader(false)
        setDescriptionImage(fileUrl)
      }
    })
  }

  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.name) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.description) { errors.description = formatMessage({ id: 'common_field_error.required' }) }
    return errors
  }

  // Button handlers
  const onUpdateImageClicked = () => {
    setShowImageUploader(true)
  }

  const onCancelSelectImageClick = () => {
    setShowImageUploader(false)
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_ANSWER,
    {
      variables: { id: params.answerId },
      skip: isCreating,
      onCompleted: onFetchAnsewerSuccess,
      onError
    }
  )
  const [createAnswer, { loading: creating }] = useMutation(CREATE_ANSWER, { onCompleted: onSuccess, onError })
  const [updateAnswer, { loading: updating }] = useMutation(UPDATE_ANSWER, { onCompleted: onSuccess, onError })
  const [updateAnswerDescriptionUrl, { loading: updatingDescriptionUrl }] = useMutation(UPDATE_ANSWER_DESCRIPTION_URL, { onCompleted: onSuccess, onError })

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

            {/* Name */}
            <div className='row'>
              <div className='col-md-12 col-xs-12'>
                <span className='text-left pl-1 pb-1'>
                  <FormattedMessage id='answer_name' />
                </span>
                <FieldWrapper fieldName='name' validations={required} placeHolder={formatMessage({ id: 'answer_name' })} />
              </div>
            </div>

            {/* Description */}
            <div className='row'>
              <div className='col-md-12 col-xs-12'>
                <span className='text-left pl-1 pb-1'>
                  <FormattedMessage id='answer_description' />
                </span>
                <FieldWrapper fieldName='description' placeHolder={formatMessage({ id: 'answer_description' })} />
              </div>
            </div>

            {/* Visual description */}
            {!fetching && !isCreating && (
              <div className='row mb-4'>
                <div className='col-md-12 col-xs-12'>
                  <span className='text-left pl-1 pb-1'>
                    <FormattedMessage id='answer_visual_description' />
                  </span>
                  {showImageUploader
                    ? (
                      <ImageUploader
                        id={params.answerId}
                        disabled={false}
                        onUploadSuccess={onUploadComplete}
                        oldImage={initialValues.descriptionUrl}
                        onCancelClick={onCancelSelectImageClick}
                      />)
                    : <VisualDescription url={descriptionImage} onChangeClicked={onUpdateImageClicked} />}
                </div>
              </div>
            )}

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
                isDisabled={creating || updating || updatingDescriptionUrl || fetching || pristine}
                isLoading={creating || updating || updatingDescriptionUrl || fetching}
              />
              <ButtonGoTo
                path={`/exercises/${params.exerciseId}`}
                color='secondary'
                translatableTextId='button.go_to_exercise'
                isDisabled={creating || updating || updatingDescriptionUrl || fetching}
              />
            </div>

          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(AnswersEditor)
