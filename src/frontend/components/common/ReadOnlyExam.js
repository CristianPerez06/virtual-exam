import React from 'react'
import { Form, FormGroup, Label, Input } from 'reactstrap'
import { ButtonGoTo } from '../../components/common'
import { injectIntl } from 'react-intl'
import { FaCheck, FaCheckDouble, FaTimesCircle } from 'react-icons/fa'

const ReadOnlyExam = (props) => {
  // Props and params
  const { exam, parent } = props

  return (
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
          path={`/${parent}/list`}
          color='secondary'
          translatableTextId='button.go_to_list'
        />
      </div>
    </Form> 
  )
}

export default injectIntl(ReadOnlyExam)
