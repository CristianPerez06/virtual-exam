import React, { useState } from 'react'
import { injectIntl } from 'react-intl'
import { getTranslatableErrors } from '../../../common/graphqlErrorHandlers'
import AddExerciseSelector from './AddExerciseSelector'
import EditExercisesList from './EditExercisesList'
import { useAlert } from '../../../hooks'

const ExamTemplateExercises = (props) => {
  // Props and params
  const { examTemplateId, courseId, intl } = props
  const { formatMessage } = intl

  // Hooks
  const { alertError } = useAlert()

  // State
  const [forceRefresh, setForceRefresh] = useState(true)

  // Handlers
  const onAddExerciseSuccess = (res) => {
    setForceRefresh(true)
  }

  const onSuccess = (res) => {
    setForceRefresh(false)
  }

  const onError = (err) => {
    setForceRefresh(false)
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
  }

  return (
    <div className='exam-template-exercises border shadow p-3 mb-3 bg-white rounded d-block'>
      <AddExerciseSelector
        examTemplateId={examTemplateId}
        courseId={courseId}
        onExerciseAdded={onAddExerciseSuccess}
        onExerciseAddError={onError}
      />
      <EditExercisesList
        examTemplateId={examTemplateId}
        onEditExercisesListSuccess={onSuccess}
        onEditExercisesListError={onError}
        forceRefetch={forceRefresh}
      />

    </div>
  )
}

export default injectIntl(ExamTemplateExercises)
