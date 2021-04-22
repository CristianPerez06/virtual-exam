import React, { useState } from 'react'
import { Card, CardBody, CardHeader, Button } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_EXERCISES, DISABLE_EXERCISE } from '../../common/requests/exercises'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Loading, CustomAlert, TranslatableErrors, Table, DeleteModal } from '../../components/common'
import { Link } from 'react-router-dom'
import { syncExercisesCacheOnDelete } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'

const ExercisesList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // State
  const [exercise, setExercise] = useState([])
  const [errors, setErrors] = useState(null)
  const [exerciseToDelete, setExerciseToDelete] = useState(null)
  const [exerciseDeleted, setExerciseDeleted] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  // handlers
  const onCompleted = (res) => {
    if (!res) return
    setExercise(res.listExercises.data)
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
        setExercise(updatedExercisesList.data)
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

  const columnTranslations = {
    exerciseName: formatMessage({ id: 'exercise_name' }),
    action: formatMessage({ id: 'action' }),
    edit: formatMessage({ id: 'button.edit' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columns = React.useMemo(
    () => {
      return [{
        Header: columnTranslations.exerciseName,
        accessor: 'name',
        Cell: ({ row }) => row.values.name
      },
      {
        Header: columnTranslations.action,
        Cell: ({ row }) => (
          <div className='d-flex justify-content-center'>
            <Link to={`/exercises/${row.original.id}`}>
              <Button color='info'>{columnTranslations.edit}</Button>
            </Link>
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
            {exercise.length === 0
              ? <div id='no-results' className='mb-3'><FormattedMessage id='common_message.no_results' /></div>
              : <Table columns={columns} data={exercise} />}

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
