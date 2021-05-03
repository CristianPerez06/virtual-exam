import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_EXERCISES, DISABLE_EXERCISE } from '../../common/requests/exercises'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Loading, CustomAlert, TranslatableErrors, DeleteModal, TwoColumnsTable } from '../../components/common'
import { syncExercisesCacheOnDelete } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'

const ExercisesList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // State
  const [exercises, setExercises] = useState([])
  const [errors, setErrors] = useState(null)
  const [exerciseToDelete, setExerciseToDelete] = useState(null)
  const [exerciseDeleted, setExerciseDeleted] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  // Handlers
  const onCompleted = (res) => {
    if (!res) return
    setExercises(res.listExercises.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)

    setErrors(translatableErrors)
    setExerciseDeleted(false)
    setDeleteModalIsOpen(false)
  }

  // Button handlers
  const onDeleteClicked = (exercise) => {
    setExerciseToDelete(exercise)
    setDeleteModalIsOpen(true)
  }

  const onDeleteConfirmClicked = () => {
    disableExercise({
      variables: { id: exerciseToDelete.id },
      update: (cache, result) => {
        const updatedExercisesList = syncExercisesCacheOnDelete(cache, exerciseToDelete)
        setExercises(updatedExercisesList.data)
      }
    })
  }

  const onCancelClicked = () => {
    if (deleting) return
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  // Other
  const stateCleanupOnDelete = () => {
    setErrors()
    setDeleteModalIsOpen(false)
    setExerciseDeleted(true)
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(LIST_EXERCISES, { variables: {}, onCompleted, onError })
  const [disableExercise, { loading: deleting }] = useMutation(DISABLE_EXERCISE, { onCompleted: stateCleanupOnDelete, onError })

  return (
    <div className='exercises-list' style={{ width: 850 + 'px' }}>
      {fetching && <Loading />}
      {!fetching &&
        <Card className='mx-auto'>
          <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
            <p className='h4'>
              <FormattedMessage id='common_entity.exercises' />
            </p>
          </CardHeader>
          <CardBody className='d-flex flex-column text-center'>
            <TwoColumnsTable
              entityName='exercise'
              entitiesPath='exercises'
              items={exercises}
              canEdit
              canDelete
              onDeleteClicked={onDeleteClicked}
            />

            {/* Delete modal */}
            <div id='delete-modal'>
              <DeleteModal
                modalIsOpen={deleteModalIsOpen}
                isBussy={deleting}
                onCloseClick={() => onCancelClicked()}
                onDeleteClick={() => onDeleteConfirmClicked()}
              />
            </div>

            {/* Alerts */}
            {!deleting && exerciseDeleted && <CustomAlert messages={{ id: 'exercise_deleted', message: `${formatMessage({ id: 'exercise_deleted' })}: ${exerciseToDelete.name}` }} color='success' />}
          </CardBody>
        </Card>}
      {errors && <TranslatableErrors errors={errors} />}
    </div>
  )
}

export default injectIntl(ExercisesList)
