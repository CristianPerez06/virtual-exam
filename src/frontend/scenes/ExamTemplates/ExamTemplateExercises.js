import React, { useState } from 'react'
import { Button } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import Select from 'react-select'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { LIST_EXERCISES } from '../../common/requests/exercises'
import { ADD_EXERCISE_TO_EXAM_TEMPLATE, LIST_EXAM_TEMPLATE_EXERCISES, REMOVE_EXERCISE_FROM_EXAM_TEMPLATE } from '../../common/requests/templates'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { TranslatableErrors, DeleteModal, Table, NoResults, CustomAlert } from '../../components/common'
import { syncCacheOnAddTemplateExercise, syncCacheOnRemoveTemplateExercise } from './cacheHelpers'

const ExamTemplateExercises = (props) => {
  // Props and params
  const {
    examTemplateId,
    courseId,
    cleanMessages,
    intl
  } = props
  const { formatMessage } = intl

  // State
  const [exercises, setExercises] = useState([])
  const [templateExercises, setTemplateExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState()
  const [templateExerciseToDelete, setTemplateExerciseToDelete] = useState()
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
  const [errors, setErrors] = useState()
  const [alerts, setAlerts] = useState()
  const [exerciseModifyErrors, setExerciseModifyErrors] = useState(false)

  // Handlers
  const onSuccess = (result) => {
    setSelectedExercise()
    setErrors()
    setExerciseModifyErrors()
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setErrors(translatableErrors)
  }

  const onExerciseModifyError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setExerciseModifyErrors(translatableErrors)
  }

  const onFetchExercisesSuccess = (result) => {
    if (!result) return
    const mappedExercises = result.listExercises.data.map((exercise) => {
      return {
        value: exercise.id,
        label: exercise.name
      }
    })
    setExercises(mappedExercises)
  }

  const onFetchTemplateExercisesSuccess = (result) => {
    if (!result) return
    const templateExercises = result.listExamTemplateExercises.data
    setTemplateExercises(templateExercises)
    const alerts = getAlerts(templateExercises)
    setAlerts(alerts)
  }

  const onDeleteConfirmClicked = () => {
    removeExerciseFromExamTemplate({
      variables: { templateId: examTemplateId, exerciseId: templateExerciseToDelete.id },
      update: (cache, result) => {
        const variables = { id: examTemplateId }
        const updatedTemplateExercisesList = syncCacheOnRemoveTemplateExercise(cache, templateExerciseToDelete, variables)
        setTemplateExercises(updatedTemplateExercisesList.data)
        const alerts = getAlerts(updatedTemplateExercisesList.data)
        setAlerts(alerts)
      }
    })
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  const onCancelClicked = () => {
    if (removingExerciseFromTemplate) return
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  const getAlerts = (exercisesList) => {
    if (exercisesList.length <= 1) {
      const moreExercisesNeeded = { id: 'at_least_two_exercises_needed' }
      return moreExercisesNeeded
    }
  }

  // Button handlers
  const onAddExerciseClicked = async () => {
    addExerciseToExamTemplate({
      variables: { templateId: examTemplateId, exerciseId: selectedExercise.value },
      update: (cache, result) => {
        const variables = { id: examTemplateId }
        const updatedTemplateExercisesList = syncCacheOnAddTemplateExercise(cache, result.data.addExerciseToExamTemplate, variables)
        setTemplateExercises(updatedTemplateExercisesList.data)
        const alerts = getAlerts(updatedTemplateExercisesList.data)
        setAlerts(alerts)
      }
    })
  }

  const onDeleteClicked = (exercise) => {
    setTemplateExerciseToDelete(exercise)
    setDeleteModalIsOpen(true)
  }

  // Queries and mutations
  const { loading: fetchingExercises } = useQuery(
    LIST_EXERCISES,
    {
      variables: { courseId: courseId },
      onCompleted: onFetchExercisesSuccess,
      onError
    }
  )
  const { loading: fetchingTemplateExercises } = useQuery(
    LIST_EXAM_TEMPLATE_EXERCISES,
    {
      variables: { id: examTemplateId },
      onCompleted: onFetchTemplateExercisesSuccess,
      onError
    }
  )
  const [addExerciseToExamTemplate, { loading: addingExerciseToTemplate }] = useMutation(
    ADD_EXERCISE_TO_EXAM_TEMPLATE,
    { onCompleted: onSuccess, onError: onExerciseModifyError }
  )
  const [removeExerciseFromExamTemplate, { loading: removingExerciseFromTemplate }] = useMutation(
    REMOVE_EXERCISE_FROM_EXAM_TEMPLATE,
    { onCompleted: onSuccess, onError: onExerciseModifyError }
  )

  const columnTranslations = {
    unitName: formatMessage({ id: 'unit_name' }),
    exerciseName: formatMessage({ id: 'exercise_name' }),
    action: formatMessage({ id: 'action' }),
    edit: formatMessage({ id: 'button.edit' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columns = React.useMemo(
    () => {
      return [{
        Header: columnTranslations.unitName,
        // accessor: 'unitName',
        Cell: ({ row }) => 'TO DO - GET UNIT NAME'
      },
      {
        Header: columnTranslations.exerciseName,
        accessor: 'name',
        Cell: ({ row }) => row.values.name
      },
      {
        Header: columnTranslations.action,
        Cell: ({ row }) => (
          <div className='d-flex justify-content-center'>
            <Button
              className='ml-1'
              color='danger'
              onClick={() => onDeleteClicked({ ...row.original })}
            >
              {columnTranslations.delete}
            </Button>
          </div>
        )
      }]
    },
    [columnTranslations]
  )

  return (
    <div id='exam-template-exercises' className='mt-5'>
      <p className='text-center h5 mb-3'>
        <FormattedMessage id='common_entity.exercises' />
      </p>
      <div className='row'>
        <div className='col-md-9 col-xs-12'>
          <Select
            value={selectedExercise}
            options={exercises}
            isDisabled={fetchingExercises || addingExerciseToTemplate}
            onChange={(option) => {
              const selected = exercises.find(x => x.value === option.value)
              setSelectedExercise(selected)
              setErrors()
            }}
          />
        </div>
        <div className='col-md-3 col-xs-12 text-right'>
          <Button
            color='info'
            disabled={fetchingExercises || addingExerciseToTemplate || fetchingTemplateExercises || !selectedExercise}
            onClick={() => {
              onAddExerciseClicked()
            }}
          >
            <FormattedMessage id='button.add_exercise' />
          </Button>
        </div>
        <div id='info' className='d-flex justify-content-around mt-2 w-100'>
          {errors && <TranslatableErrors errors={errors} className='ml-3' />}
        </div>
      </div>

      <div className='row'>
        <div className='col-md-12 col-xs-12 text-right'>
          {templateExercises.length === 0
            ? <NoResults />
            : <Table columns={columns} data={templateExercises} />}
        </div>
        <div id='info-exercise-modify' className='d-flex justify-content-around mt-2 w-100'>
          {exerciseModifyErrors && !cleanMessages && <TranslatableErrors errors={exerciseModifyErrors} className='ml-3' />}
          {(alerts) && <CustomAlert messages={alerts} color='warning' />}
        </div>
      </div>

      {/* Delete modal */}
      <div id='delete-modal'>
        <DeleteModal
          modalIsOpen={deleteModalIsOpen}
          isBussy={removingExerciseFromTemplate}
          onCloseClick={() => onCancelClicked()}
          onDeleteClick={() => onDeleteConfirmClicked()}
        />
      </div>

      <hr />
    </div>
  )
}

export default injectIntl(ExamTemplateExercises)
