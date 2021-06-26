import React, { useState } from 'react'
import { FormGroup, Card, CardHeader, CardBody, Collapse, Button } from 'reactstrap'
import { BlackWhiteImg } from '../../../components/common'
import AnswerSelector from './AnswerSelector'
import { injectIntl } from 'react-intl'
import { FaChevronCircleRight, FaChevronCircleDown } from 'react-icons/fa'


const ExerciseSelector = (props) => {
  // Props and params
  const { exercise, index, disabled, onAnswerClick } = props

  // State
  const [collapse, setCollapse] = useState(true)

  const onCardClick = () => {
    setCollapse(!collapse)
  }

  return (
    <div className='exercise-container'>
      <Card>
        <CardHeader className='d-flex'>
          <Button onClick={onCardClick}>
            {collapse ? <FaChevronCircleRight /> : <FaChevronCircleDown />}
          </Button>
          <span className='d-flex align-items-center ml-4'>
            {index} - {exercise.name}
          </span>
        </CardHeader>
        <Collapse isOpen={!collapse}>
          <CardBody>
            <FormGroup tag='fieldset'>
              {/* Exercise description */}
              {exercise.description && <span className='d-block'>{exercise.description}</span>}

              {/* Exercise image description */}
              {exercise.descriptionUrl &&<div className='text-center mt-2'><BlackWhiteImg url={exercise.descriptionUrl} /></div>}
              <hr />

              {/* Exercise answers */}
              {exercise.answers.map((answer) =>
                <AnswerSelector
                  key={answer.id}
                  exerciseId={exercise.id}
                  answer={answer}
                  disabled={disabled}
                  onAnswerClick={onAnswerClick}
                />
              )}
            </FormGroup>
          </CardBody>
        </Collapse>
      </Card>
      <hr />
    </div>
  )
}

export default injectIntl(ExerciseSelector)
