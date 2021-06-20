import React from 'react'
import { Form, FormGroup, Label, Input } from 'reactstrap'
import { ButtonGoTo } from '../../components/common'
import { EXAM_SETTINGS } from '../../common/constants'
import { injectIntl, FormattedMessage } from 'react-intl'
import { FaCheck, FaCheckDouble, FaTimesCircle } from 'react-icons/fa'

const ReadOnlyExam = (props) => {
  // Props and params
  const { exam, goBackPath } = props

  return (
    <Form>
      <div className='timer d-flex justify-content-between'>
        <span className='h3'>
          {exam.score >= EXAM_SETTINGS.PASSING_SCORE
            ? <FormattedMessage id='exams_passed' />
            : <FormattedMessage id='exams_failed' />}
        </span>

        <div className='border border-secondary shadow p-2 mb-1 bg-white rounded text-right'>
          <i><FormattedMessage id='score' />: {exam.score}</i>
        </div>
      </div>
      <hr />
      <Label className='h4'>{exam.name}</Label>
      {exam.exercises.map((exercise, exerciseIndex) => {
        const solvedCorrectly = exercise.answers.find(x => x.correct && x.selected)
        const exercisePoints = solvedCorrectly ? exercise.points : 0

        return (
          <div className='exam-item' key={exerciseIndex}>
            <FormGroup tag='fieldset'>
              <span className='d-block'>{exerciseIndex + 1} - {exercise.name}</span>
              <span className='d-block'>{exercise.description}</span>
              <table>
                <tbody>
                  {exercise.answers.map((answer, answerIndex) => {
                    return (
                      <tr key={answerIndex}>
                        <td style={{ width: 40 + 'px' }}>
                          {answer.correct && <FaCheck />}
                        </td>
                        <td style={{ width: 40 + 'px' }}>
                          {answer.selected && answer.correct && <FaCheckDouble />}
                          {answer.selected && !answer.correct && <FaTimesCircle />}
                        </td>
                        <td>
                          <FormGroup check>
                            <Label check>
                              <Input type='radio' name={exercise.id} disabled defaultChecked={answer.selected} />{' '}
                              {answer.name}
                            </Label>
                          </FormGroup>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <span className='d-block mt-2'>
                <i><FormattedMessage id='points' />: {exercisePoints}</i>
              </span>
              <hr />
            </FormGroup>
          </div>
        )
      })}
      <div id='buttons' className='d-flex justify-content-center'>
        <ButtonGoTo
          path={goBackPath}
          color='secondary'
          translatableTextId='button.go_to_list'
        />
      </div>
    </Form>
  )
}

export default injectIntl(ReadOnlyExam)
