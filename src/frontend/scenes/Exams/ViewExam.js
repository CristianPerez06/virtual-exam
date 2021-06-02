import React, { useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { Form, FormGroup, Label, Input } from 'reactstrap'
import { useQuery } from '@apollo/react-hooks'
import { Loading, CustomAlert, ButtonGoTo } from '../../components/common'
import { injectIntl } from 'react-intl'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { GET_EXAM } from '../../common/requests/exams'
import { FaCheck, FaCheckDouble, FaTimesCircle } from 'react-icons/fa'

const ViewExam = (props) => {
  // Props and params
  const { params } = useRouteMatch()

  // State
  const [exam, setExam] = useState()
  const [errors, setErrors] = useState()

  // Handlers
  const onSuccess = (result) => {
    if (!result) return
    setExam(result.getExam)
    setErrors()
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setErrors(translatableErrors)
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_EXAM,
    {
      variables: { id: params.id },
      skip: !params.id,
      onCompleted: onSuccess,
      onError
    }
  )

  if (fetching) return <Loading />

  return (
    <div className='view-exam border shadow p-3 mb-3 bg-white rounded' style={{ width: 850 + 'px' }}>
      {!fetching && exam && (
        <Form>
          <Label className='h4'>{exam.name}</Label>
          {exam.exercises.map((exercise, exerciseIndex) => {
            return (
              <div className='exam-item' key={exerciseIndex}>
                <span className='d-block'>{exerciseIndex + 1} - {exercise.name}</span>
                <span className='d-block'>{exercise.description}</span>
                <table>
                  <tbody>
                    {exercise.answers.map((answer, answerIndex) => {
                      return (
                        <tr key={answerIndex}>
                          <td style={{ width: 40 + 'px' }}>
                            {answer.correct && <FaCheck /> }
                          </td>
                          <td style={{ width: 40 + 'px' }}>
                            {answer.selected && answer.correct && <FaCheckDouble />}
                            {answer.selected && !answer.correct && <FaTimesCircle />}
                          </td>
                          <td>
                            <FormGroup check>
                              <Label check>
                                <Input type='radio' name='radio1' disabled checked={answer.selected}/>{' '}
                                {answer.name}
                              </Label>
                            </FormGroup>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <hr />
              </div>
            )
          })}
          <div id='buttons' className='d-flex justify-content-center'>
            <ButtonGoTo
              path='/exams/list'
              color='secondary'
              translatableTextId='button.go_to_list'
              isDisabled={fetching}
            />
          </div>

          {(errors) && (
            <div id='info' className='d-flex justify-content-around mt-4'>
              {errors && <CustomAlert messages={errors} className='ml-3' />}
            </div>
          )}
        </Form>
      )}
      {errors && <CustomAlert messages={errors} className='ml-3' />}
    </div>
  )
}

export default injectIntl(ViewExam)
