import React from 'react'
import { FormGroup, Label, Input } from 'reactstrap'
import { BlackWhiteImg } from '../../../components/common'
import { injectIntl } from 'react-intl'

const AnswerSelector = (props) => {
  // Props and params
  const { exerciseId, answer, disabled, onAnswerClick } = props

  return (
    <div className='answer-container d-flex justify-content-center'>
      <FormGroup
        check
        key={answer.id}
        className='border rounded form-check w-75 pl-0 mt-2 mb-2'
        onChange={() => onAnswerClick({ exerciseId: exerciseId, answerId: answer.id })}
      >
        <div className='row ml-0 mr-0 bg-light border-bottom'>
          <div className='col-md-1 col-xs-12'>
            <Label check>
              <Input type='radio' className='position-relative ml-0 mr-0' name={exerciseId} disabled={disabled} />{' '}
            </Label>
          </div>
          <div className='col-md-11 col-xs-12'>
            {answer.name}
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

export default injectIntl(AnswerSelector)
