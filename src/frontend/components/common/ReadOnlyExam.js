import React from 'react'
import { Form, Label } from 'reactstrap'
import { ButtonGoTo } from '../../components/common'
import { EXAM_SETTINGS } from '../../common/constants'
import { injectIntl, FormattedMessage } from 'react-intl'
import ReadOnlyExamExercise from './ReadOnlyExamExercise'

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
        return (
          <ReadOnlyExamExercise
            key={exerciseIndex}
            exercise={exercise}
            index={exerciseIndex + 1}
          />
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
