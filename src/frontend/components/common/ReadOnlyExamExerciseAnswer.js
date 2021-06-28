import React from 'react'
import { FormGroup, Label, Input } from 'reactstrap'
import { BlackWhiteImg } from '../../components/common'
import { injectIntl } from 'react-intl'
import { FaCheck, FaCheckDouble, FaTimes } from 'react-icons/fa'

const ReadOnlyExamExerciseAnswer = (props) => {
  // Props and params
  const { exerciseId, answer } = props

  return (
    <div className='answer-container d-flex justify-content-center'>
      <FormGroup
        check
        key={answer.id}
        className='border rounded form-check w-75 pl-0 mt-2 mb-2'
      >
        <div className='row ml-0 mr-0 bg-light border-bottom'>
          <div className='col-md-10 col-xs-12'>
            <Label check>
              <Input type='radio' className='position-relative ml-0 mr-0' name={exerciseId} disabled defaultChecked={answer.selected} />{' '} 
            </Label>
            <span className='ml-2'>
              {answer.name}
            </span>
          </div>
          <div className='col-md-2 col-xs-12'>
            {answer.correct && <FaCheck />}
            {answer.selected && answer.correct && <FaCheckDouble />}
            {answer.selected && !answer.correct && <FaTimes />}
          </div>
        </div>
        {(answer.description || answer.descriptionUrl) && (
          <div className='row ml-0 mr-0'>
            {(answer.description && !answer.descriptionUrl) && <span className='ml-3'>{answer.description}</span>}
            {(answer.descriptionUrl) && <div className='w-100 text-center'><BlackWhiteImg url={answer.descriptionUrl} /></div>}
          </div>
        )}
      </FormGroup>
    </div>
  )
}

export default injectIntl(ReadOnlyExamExerciseAnswer)
