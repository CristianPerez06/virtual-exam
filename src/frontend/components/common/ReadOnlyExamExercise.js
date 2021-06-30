import React, { useState } from 'react'
import { FormGroup, Card, CardHeader, CardBody, Collapse, Button } from 'reactstrap'
import { BlackWhiteImg } from '../../components/common'
import ReadOnlyExamExerciseAnswer from './ReadOnlyExamExerciseAnswer'
import { injectIntl, FormattedMessage } from 'react-intl'
import { FaChevronCircleRight, FaChevronCircleDown } from 'react-icons/fa'


const ReadOnlyExamExercise = (props) => {
  // Props and params
  const { exercise, index } = props

  // State
  const [collapse, setCollapse] = useState(true)

  const solvedCorrectly = exercise.answers.find(x => x.correct && x.selected)
  const exercisePoints = solvedCorrectly ? exercise.points : 0

  const onCardClick = () => {
    setCollapse(!collapse)
  }

  return (
    <div className='exercise-container'>
      <Card>
        <CardHeader className='d-flex'>
          <div className='row w-100'>
            <div className='col-md-10 col-xs-12'>
              <div className='d-flex'>
                <>
                  <Button onClick={onCardClick}>
                    {collapse ? <FaChevronCircleRight /> : <FaChevronCircleDown />}
                  </Button>
                </>
                <span className='d-flex align-items-center ml-4'>
                  {index} - {exercise.name}
                </span>
              </div>
            </div>
            <div className='col-md-2 col-xs-12'>
              <span className='d-flex align-items-center'>
                <b><i><FormattedMessage id='points' />: {exercisePoints}</i></b>
              </span>
            </div>
          </div>
        </CardHeader>
        <Collapse isOpen={!collapse}>
          <CardBody>
            <FormGroup tag='fieldset'>
              {/* Exercise description */}
              {exercise.description && <span className='d-block'>{exercise.description}</span>}

              {/* Exercise image description */}
              {exercise.descriptionUrl && <div className='text-center mt-2'><BlackWhiteImg url={exercise.descriptionUrl} /></div>}
              <hr />

              {/* Exercise answers */}
              {exercise.answers.map((answer) =>
                <ReadOnlyExamExerciseAnswer
                  key={answer.id}
                  exerciseId={exercise.id}
                  answer={answer}
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

export default injectIntl(ReadOnlyExamExercise)
