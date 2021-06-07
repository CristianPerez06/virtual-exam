import React, { useState } from 'react'
import { injectIntl } from 'react-intl'
import { getTranslatableErrors } from '../../../common/graphqlErrorHandlers'
import { TranslatableErrors } from '../../../components/common'
import AddExerciseSelector from './AddExerciseSelector'
import EditExercisesList from './EditExercisesList'

const ExamTemplateExercises = (props) => {
  // Props and params
  const {
    examTemplateId,
    courseId
  } = props

  // State
  const [errors, setErrors] = useState()
  const [forceRefresh, setForceRefresh] = useState(true)

  // Handlers
  const onAddExerciseSuccess = (res) => {
    setForceRefresh(true)
    setErrors()
  }

  const onSuccess = (res) => {
    setForceRefresh(false)
    setErrors()
  }

  const onError = (err) => {
    setForceRefresh(false)
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setErrors(translatableErrors)
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

      {/* Errors */}
      <div id='info' className='mt-2 w-100'>
        {errors && <TranslatableErrors errors={errors} className='ml-3' />}
      </div>
    </div>
  )
}

export default injectIntl(ExamTemplateExercises)
