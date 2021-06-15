import React, { useEffect, useState } from 'react'
import { Button } from 'reactstrap'
import { injectIntl } from 'react-intl'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { LIST_EXAM_TEMPLATE_EXERCISES, REMOVE_EXERCISE_FROM_EXAM_TEMPLATE, UPDATE_EXERCISE_NOTE } from '../../../common/requests/templates'
import { DeleteModal, Table, NoResults, CustomAlert, LoadingInline } from '../../../components/common'
import { syncCacheOnUpdateTemplateExercise, syncCacheOnRemoveTemplateExercise } from '../cacheHelpers'
import EditPointsModal from './EditPointsModal'
import { BigNumber } from 'bignumber.js'

const EditExercisesList = (props) => {
  // Props and params
  const {
    examTemplateId,
    onEditExercisesListSuccess,
    onEditExercisesListError,
    forceRefetch,
    intl
  } = props

  const { formatMessage } = intl

  // State
  const [templateExercises, setTemplateExercises] = useState([])
  const [templateExerciseToDelete, setTemplateExerciseToDelete] = useState()
  const [exerciseToEditNote, setExerciseToEditNote] = useState()
  const [editPointsModalIsOpen, setEditPointsModalIsOpen] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
  const [alerts, setAlerts] = useState()

  // Handlers
  const onSuccess = (res) => {
    onEditExercisesListSuccess()
  }

  const onError = (err) => {
    onEditExercisesListError(err)
  }

  const onFetchTemplateExercisesSuccess = (res) => {
    if (!res) return
    const templateExercises = res.listExamTemplateExercises.data
    setTemplateExercises(templateExercises)

    const alerts = getValidationAlerts(templateExercises)
    setAlerts(alerts)

    onEditExercisesListSuccess(templateExercises)
  }

  // Button handlers
  const onDeleteClicked = (exercise) => {
    setTemplateExerciseToDelete(exercise)
    setDeleteModalIsOpen(true)
  }

  const onEditPointsClicked = (exercise) => {
    if (updatingExerciseNote) return
    setExerciseToEditNote(exercise)
    setEditPointsModalIsOpen(true)
  }

  const onConfirmDeleteClicked = () => {
    removeExerciseFromExamTemplate({
      variables: { templateId: examTemplateId, exerciseId: templateExerciseToDelete.id },
      update: (cache, result) => {
        const variables = { id: examTemplateId }
        const updatedTemplateExercisesList = syncCacheOnRemoveTemplateExercise(cache, templateExerciseToDelete, variables)
        setTemplateExercises(updatedTemplateExercisesList.data)

        const alerts = getValidationAlerts(updatedTemplateExercisesList.data)
        setAlerts(alerts)
      }
    })
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  const onConfirmEditPointsClicked = (points) => {
    updateExerciseNote({
      variables: { id: examTemplateId, exerciseId: exerciseToEditNote.id, exercisePoints: parseFloat(points) },
      update: (cache, result) => {
        const variables = { id: examTemplateId }
        const exerciseWithNote = { ...exerciseToEditNote, points: points }
        const updatedTemplateExercisesList = syncCacheOnUpdateTemplateExercise(cache, exerciseWithNote, variables)
        setTemplateExercises(updatedTemplateExercisesList.data)

        const alerts = getValidationAlerts(updatedTemplateExercisesList.data)
        setAlerts(alerts)
      }
    })
    setEditPointsModalIsOpen(!editPointsModalIsOpen)
  }

  const onCancelDeleteClicked = () => {
    if (removingExerciseFromTemplate) return
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  const onCancelEditPointsClicked = () => {
    if (updatingExerciseNote) return
    setExerciseToEditNote()
    setEditPointsModalIsOpen(!editPointsModalIsOpen)
  }

  // Queries and mutations
  const { loading: fetchingTemplateExercises, refetch } = useQuery(
    LIST_EXAM_TEMPLATE_EXERCISES,
    {
      variables: { id: examTemplateId },
      notifyOnNetworkStatusChange: true,
      onCompleted: onFetchTemplateExercisesSuccess,
      onError
    }
  )
  const [removeExerciseFromExamTemplate, { loading: removingExerciseFromTemplate }] = useMutation(
    REMOVE_EXERCISE_FROM_EXAM_TEMPLATE,
    { onCompleted: onSuccess, onError: onError }
  )
  const [updateExerciseNote, { loading: updatingExerciseNote }] = useMutation(
    UPDATE_EXERCISE_NOTE,
    { onCompleted: onSuccess, onError: onError }
  )

  // Other
  const getValidationAlerts = (exercisesList) => {
    if (exercisesList.length <= 1) {
      return { id: 'exam_template_at_least_two_exercises_needed' }
    }

    const exerciseWithZeroPointsExist = exercisesList.some(x => parseFloat(x.points) === 0)
    if (exerciseWithZeroPointsExist) {
      return { id: 'exam_template_all_exercises_must_have_points' }
    }

    const sumPoints = exercisesList.reduce((accumulator, current) => accumulator + parseFloat(current.points), 0)
    const totalPoints = new BigNumber(sumPoints)
    if (totalPoints.isEqualTo(0)) {
      return { id: 'exam_template_note_cant_be_zero' }
    }
    if (totalPoints.isLessThan(9.99)) {
      return { id: 'exam_template_note_must_be_close_to_nine_ninetynine' }
    }
    if (totalPoints.isGreaterThan(10)) {
      return { id: 'exam_template_note_cant_be_higher_than_ten' }
    }
  }

  // Force refetch Exam Template Exercises
  useEffect(() => {
    refetch()
  }, [refetch, forceRefetch])

  const columnTranslations = {
    unitName: formatMessage({ id: 'unit_name' }),
    exerciseName: formatMessage({ id: 'exercise_name' }),
    action: formatMessage({ id: 'action' }),
    points: formatMessage({ id: 'points' }),
    edit_points: formatMessage({ id: 'button.edit_points' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columns = [
    {
      Header: columnTranslations.unitName,
      // accessor: 'unitName',
      Cell: ({ row }) => 'TO DO - GET UNIT NAME'
    },
    {
      Header: columnTranslations.exerciseName,
      accessor: 'name',
      Cell: ({ row }) => row.original.name
    },
    {
      Header: columnTranslations.points,
      accessor: 'points',
      Cell: ({ row }) => row.original.points
    },
    {
      Header: columnTranslations.action,
      Cell: ({ row }) => (
        <div className='d-flex justify-content-center'>
          <Button
            className='ml-1'
            color='info'
            disabled={fetchingTemplateExercises || updatingExerciseNote || removingExerciseFromTemplate}
            onClick={() => onEditPointsClicked({ ...row.original })}
          >
            {columnTranslations.edit_points}
          </Button>
          <Button
            className='ml-1'
            color='danger'
            disabled={fetchingTemplateExercises || updatingExerciseNote || removingExerciseFromTemplate}
            onClick={() => onDeleteClicked({ ...row.original })}
          >
            {columnTranslations.delete}
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className='edit-exercises-list'>
      <div className='row'>
        <div className='col-md-12 col-xs-12 text-right'>
          {fetchingTemplateExercises && <div className='text-center mt-2'><LoadingInline color='grey' /></div>}
          {!fetchingTemplateExercises && templateExercises.length === 0 && <NoResults />}
          {!fetchingTemplateExercises && templateExercises.length !== 0 && <Table columns={columns} data={templateExercises} />}
        </div>
      </div>

      {/* Alerts */}
      <div className='row'>
        {alerts && <CustomAlert messages={alerts} color='warning' />}
      </div>

      {/* Delete modal */}
      <div id='delete-modal'>
        <DeleteModal
          modalIsOpen={deleteModalIsOpen}
          isBussy={removingExerciseFromTemplate}
          onCloseClick={onCancelDeleteClicked}
          onDeleteClick={onConfirmDeleteClicked}
        />
      </div>

      {/* Edit points modal */}
      <div id='edit-points-modal'>
        <EditPointsModal
          points={(exerciseToEditNote || {}).points}
          modalIsOpen={editPointsModalIsOpen}
          headerTextId='common_title.edit_points'
          buttonTextId='button.confirm'
          buttonColor='success'
          onCloseClick={onCancelEditPointsClicked}
          onConfirmClick={onConfirmEditPointsClicked}
        />
      </div>
    </div>
  )
}

export default injectIntl(EditExercisesList)
