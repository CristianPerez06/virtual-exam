import React, { useState } from 'react'
import { Button } from 'reactstrap'
import { LoadingInline } from '../../../components/common'
import { injectIntl, FormattedMessage } from 'react-intl'
import Select from 'react-select'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { LIST_VALID_EXERCISES } from '../../../common/requests/exercises'
import { ADD_EXERCISE_TO_EXAM_TEMPLATE } from '../../../common/requests/templates'
import { syncCacheOnAddTemplateExercise } from '../cacheHelpers'
import { useAlert } from '../../../hooks'

const AddExerciseSelector = (props) => {
  // Props and params
  const {
    examTemplateId,
    courseId,
    onExerciseAdded,
    onExerciseAddError,
    intl
  } = props
  const { formatMessage } = intl

  // Hooks
  const { alertSuccess } = useAlert()

  // State
  const [exercises, setExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState()

  // Handlers
  const onSuccess = (res) => {
    setSelectedExercise()
    alertSuccess(formatMessage({ id: 'exam_template_exercise_added' }))
    onExerciseAdded()
  }

  const onError = (err) => {
    onExerciseAddError(err)
  }

  const onFetchExercisesSuccess = (res) => {
    if (!res) return
    const mappedExercises = res.listValidExercises.data.map((exercise) => {
      return {
        value: exercise.id,
        label: exercise.name
      }
    })
    setExercises(mappedExercises)
  }

  // Button handlers
  const onAddExerciseClicked = async () => {
    addExerciseToExamTemplate({
      variables: { templateId: examTemplateId, exerciseId: selectedExercise.value },
      update: (cache, result) => {
        const variables = { id: examTemplateId }
        syncCacheOnAddTemplateExercise(cache, result.data.addExerciseToExamTemplate, variables)
      }
    })
  }

  // Queries and mutations
  const { loading: fetchingValidExercises } = useQuery(
    LIST_VALID_EXERCISES,
    {
      variables: { courseId: courseId },
      fetchPolicy: 'network-only',
      onCompleted: onFetchExercisesSuccess,
      onError
    }
  )

  const [addExerciseToExamTemplate, { loading: addingExerciseToTemplate }] = useMutation(
    ADD_EXERCISE_TO_EXAM_TEMPLATE,
    { onCompleted: onSuccess, onError: onError }
  )

  return (
    <div className='add-exercise-selector'>
      <p className='text-center h5 mb-3'>
        <FormattedMessage id='common_entity.exercises' />
      </p>
      <div className='row'>
        <div className='col-md-9 col-xs-12'>
          <Select
            value={selectedExercise}
            options={exercises}
            isDisabled={fetchingValidExercises || addingExerciseToTemplate}
            onChange={(option) => {
              const selected = exercises.find(x => x.value === option.value)
              setSelectedExercise(selected)
            }}
          />
        </div>
        <div className='col-md-3 col-xs-12 text-right'>
          <Button
            color='info'
            disabled={fetchingValidExercises || addingExerciseToTemplate || !selectedExercise}
            onClick={() => {
              onAddExerciseClicked()
            }}
          >
            <FormattedMessage id='button.add_exercise' />
            {addingExerciseToTemplate && <LoadingInline className='ml-3' />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default injectIntl(AddExerciseSelector)
