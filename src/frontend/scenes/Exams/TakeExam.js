import React, { useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { Button, Form, FormGroup, Label, Input } from 'reactstrap'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Loading, ButtonGoTo, ModalWrapper, Timer } from '../../components/common'
import { injectIntl, FormattedMessage } from 'react-intl'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { GET_EXAM, FINISH_EXAM } from '../../common/requests/exams'
import Cookies from 'js-cookie'
import { COOKIE_NAMES, EXAM_SETTINGS } from '../../common/constants'
import { syncCacheOnFinishExam } from './cacheHelpers'
import { useAlert } from '../../hooks'

const TakeExam = (props) => {
  // Props and params
  const { intl } = props
  const { params } = useRouteMatch()
  const { formatMessage } = intl

  // State
  const [exam, setExam] = useState()
  const [examCompleted, setExamCompleted] = useState(false)
  const [answerPerExerciseList, setAnswerPerExerciseList] = useState([])
  const [finishConfirmModalIsOpen, setFinishConfirmModalIsOpen] = useState(false)

  // Hooks
  const { alertSuccess, alertError } = useAlert()

  // Handlers
  const onSuccess = (result) => {
    setExamCompleted(true)
  }

  const onFetchExamSuccess = (result) => {
    if (!result) return
    setExam(result.getExam)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
  }

  const onTimeExpired = () => {
    finishExam({
      variables: { id: params.id, answerPerExerciseList: answerPerExerciseList },
      update: (cache, result) => {
        const variables = { idNumber: Cookies.get(COOKIE_NAMES.USER) }
        syncCacheOnFinishExam(cache, result.data.finishExam, variables)
        setFinishConfirmModalIsOpen(false)

        alertSuccess(formatMessage({ id: 'exams_finalized_successfully' }))
      }
    })
  }

  // Button handlers
  const onAnswerClick = (selectedItem) => {
    const list = answerPerExerciseList.filter(x => x.exerciseId !== selectedItem.exerciseId)
    list.push(selectedItem)
    setAnswerPerExerciseList(list)
  }

  const onFinishExamClicked = () => {
    setFinishConfirmModalIsOpen(true)
  }

  const onCancelFinishClicked = () => {
    if (finishingExam) return
    setFinishConfirmModalIsOpen(!finishConfirmModalIsOpen)
  }

  const onConfirmFinishClicked = () => {
    finishExam({
      variables: { id: params.id, answerPerExerciseList: answerPerExerciseList },
      update: (cache, result) => {
        const variables = { idNumber: Cookies.get(COOKIE_NAMES.USER) }
        syncCacheOnFinishExam(cache, result.data.finishExam, variables)
        setFinishConfirmModalIsOpen(false)

        alertSuccess(formatMessage({ id: 'exams_finalized_successfully' }))
      }
    })
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_EXAM,
    {
      variables: { id: params.id },
      skip: !params.id,
      onCompleted: onFetchExamSuccess,
      onError
    }
  )
  const [finishExam, { loading: finishingExam }] = useMutation(FINISH_EXAM, { onCompleted: onSuccess, onError })

  if (fetching) return <Loading />

  return (
    <div className='take-exam position border shadow p-3 mb-3 bg-white rounded' style={{ width: 850 + 'px' }}>
      {!fetching && exam && (
        <Form>
          {!examCompleted && <Timer startTime={new Date(exam.created)} minutesToExpire={EXAM_SETTINGS.MINUTES_TO_EXPIRATION} onTimeExpired={onTimeExpired} />}
          <Label className='h4'>{exam.name}</Label>
          {exam.exercises.map((exercise, exerciseIndex) => {
            return (
              <div className='exam-item' key={exerciseIndex}>
                <FormGroup tag='fieldset'>
                  {/* Exercise name */}
                  <span className='d-block'>{exerciseIndex + 1} - {exercise.name}</span>

                  {/* Exercise description */}
                  {exercise.descriptionUrl
                    ? (
                      <div className='w-100 text-center'>
                        <img style={{ maxWidth: 600 + 'px' }} src={exercise.descriptionUrl} alt='' />
                      </div>
                      )
                    : <span>{exercise.description}</span>}

                  {/* Exercise answers */}
                  {exercise.answers.map((answer) => {
                    return (
                      <FormGroup
                        check
                        key={answer.id}
                        className='ml-3'
                        onChange={() => onAnswerClick({ exerciseId: exercise.id, answerId: answer.id })}
                      >
                        <Label check>
                          <Input type='radio' name={exercise.id} disabled={exam.completed || examCompleted} />{' '}
                          {answer.name}
                        </Label>
                      </FormGroup>
                    )
                  })}
                </FormGroup>
                <hr />
              </div>
            )
          })}
          <div id='buttons' className='d-flex justify-content-center'>
            <Button
              color='success'
              className='m-2'
              disabled={finishingExam || examCompleted || exam.completed}
              onClick={onFinishExamClicked}
            >
              <FormattedMessage id='exam_finish_exam' />
            </Button>
            <ButtonGoTo
              path='/exams/list'
              color='secondary'
              translatableTextId='button.go_to_list'
              isDisabled={fetching || finishingExam}
            />
          </div>

          {/* {(errors) && (
            <div id='info' className='d-flex justify-content-around mt-3'>
              {errors && <CustomAlert messages={errors} className='ml-3' />}
            </div>
          )} */}
        </Form>
      )}
      <div id='confirm-finish-modal'>
        <ModalWrapper
          modalIsOpen={finishConfirmModalIsOpen}
          headerTextId='common_title.finish_exam_confirmation'
          bodyTextId='confirm_finish_exam'
          buttonTextId='button.confirm'
          buttonColor='danger'
          onCloseClick={() => onCancelFinishClicked()}
          onConfirmClick={() => onConfirmFinishClicked()}
        />
      </div>
    </div>
  )
}

export default injectIntl(TakeExam)
