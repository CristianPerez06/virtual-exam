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
  const [answerIsSelected, setAnswerIsSelected] = useState(false)

  const onCardClick = () => {
    setCollapse(!collapse)
  }

  const onAnswerSelected = (selectedItem) => {
    setAnswerIsSelected(true)
    onAnswerClick(selectedItem)
  }

  return (
    <div className='exercise-container mb-2'>
      <Card>
        <CardHeader className='d-flex p-2'>
          <>
            <Button onClick={onCardClick} color={answerIsSelected ? 'secondary' : 'warning'}>
              {collapse ? <FaChevronCircleRight /> : <FaChevronCircleDown />}
            </Button>
          </>
          <span className='d-flex align-items-center ml-4'>
            {index} - {exercise.name}
          </span>
        </CardHeader>
        <Collapse isOpen={!collapse}>
          <CardBody>
            <FormGroup tag='fieldset' className='mb-0'>
              {/* Exercise description */}
              {exercise.description && <span className='d-block'>{exercise.description}</span>}

              {/* Exercise image description */}
              {exercise.descriptionUrl && <div className='text-center mt-2'><BlackWhiteImg url={exercise.descriptionUrl} /><hr /></div>}

              {/* Exercise answers */}
              {exercise.answers.map((answer) =>
                <AnswerSelector
                  key={answer.id}
                  exerciseId={exercise.id}
                  answer={answer}
                  disabled={disabled}
                  onAnswerClick={onAnswerSelected}
                />
              )}
            </FormGroup>
          </CardBody>
        </Collapse>
      </Card>
    </div>
  )
}

export default injectIntl(ExerciseSelector)
