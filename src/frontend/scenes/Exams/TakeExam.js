import React, { useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { Button, Form, FormGroup, Label, Input } from 'reactstrap'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Loading, CustomAlert, ButtonGoTo, ModalWrapper } from '../../components/common'
import { injectIntl, FormattedMessage } from 'react-intl'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { GET_EXAM, FINISH_EXAM } from '../../common/requests/exams'
import Cookies from 'js-cookie'
import { COOKIE_NAMES } from '../../common/constants'
import { syncCacheOnFinishExam } from './cacheHelpers'

const TakeExam = (props) => {
  // Props and params
  const { params } = useRouteMatch()

  // State
  const [exam, setExam] = useState()
  const [examCompleted, setExamCompleted] = useState(false)
  const [answerPerExerciseList, setAnswerPerExerciseList] = useState([])
  const [errors, setErrors] = useState()
  const [finishConfirmModalIsOpen, setFinishConfirmModalIsOpen] = useState(false)

  // Handlers
  const onSuccess = (result) => {
    setExamCompleted(true)
    setErrors()
  }

  const onFetchExamSuccess = (result) => {
    if (!result) return
    setExam(result.getExam)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setErrors(translatableErrors)
  }

  // Button handlers
  const onAnswerClick = (selectedItem) => {
    const list = answerPerExerciseList.filter(x => x.exerciseId !== selectedItem.exerciseId)
    list.push(selectedItem)
    setAnswerPerExerciseList(list)
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
      }
    })
    setFinishConfirmModalIsOpen(false)
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
    <div className='take-exam border shadow p-3 mb-3 bg-white rounded' style={{ width: 850 + 'px' }}>
      {!fetching && exam && (
        <Form>
          <Label className='h4'>{exam.name}</Label>
          {exam.exercises.map((exercise, exerciseIndex) => {
            return (
              <div className='exam-item' key={exerciseIndex}>
                <span className='d-block'>{exerciseIndex + 1} - {exercise.name}</span>
                <span className='d-block'>{exercise.description}</span>
                {exercise.answers.map((answer, answerIndex) => {
                  return (
                    <FormGroup
                      check
                      key={answerIndex}
                      className='ml-3'
                      onChange={() => onAnswerClick({ exerciseId: exercise.id, answerId: answer.id })}
                    >
                      <Label check>
                        <Input type='radio' name='radio1' disabled={exam.completed || examCompleted}/>{' '}
                        {answer.name}
                      </Label>
                    </FormGroup>
                  )
                })}
                <hr />
              </div>
            )
          })}
          <div id='buttons' className='d-flex justify-content-center'>
            <Button
              color='success'
              className='m-2'
              disabled={finishingExam || examCompleted || exam.completed}
              onClick={() => {
                setFinishConfirmModalIsOpen(true)
              }}
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

          {(errors) && (
            <div id='info' className='d-flex justify-content-around mt-4'>
              {errors && <CustomAlert messages={errors} className='ml-3' />}
            </div>
          )}
        </Form>
      )}
      <div id='edit-confirm-modal'>
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
      {errors && <CustomAlert messages={errors} className='ml-3' />}
    </div>
  )
}

export default injectIntl(TakeExam)
