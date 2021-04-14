import React, { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_EXERCISES, DELETE_EXERCISE } from '../../common/requests/exercises'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Loading, LoadingInline, CustomAlert, TranslatableErrors, Table } from '../../components/common'
import { Link } from 'react-router-dom'
import { syncCacheOnDelete } from './cacheHelpers'
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
    deleteExercise({
      variables: { id: exerciseToDelete.id },
      update: (cache, result) => {
        const updatedExercisesList = syncCacheOnDelete(cache, exerciseToDelete)
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
  const { loading: fetching } = useQuery(LIST_EXERCISES, { variables: { q: '', offset: 0, limit: 100 }, onCompleted, onError })
  const [deleteExercise, { loading: deleting }] = useMutation(DELETE_EXERCISE, { onCompleted: stateCleanupOnDelete, onError })

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
    <div className='exercises-list'>
      {fetching && <Loading />}
      {!fetching &&
        <Card className='mx-auto'>
          <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
            <p className='h4'>
              <FormattedMessage id='common_entity.exercise' />
            </p>
          </CardHeader>
          <CardBody className='d-flex flex-column text-center'>
            {exercise.length === 0
              ? formatMessage({ id: 'common_message.no_results' })
              : <Table columns={columns} data={exercise} />}

            {/* Modal */}
            <div id='modal'>
              <Modal isOpen={deleteModalIsOpen} toggle={onCancelClicked} disabled>
                <ModalHeader toggle={onCancelClicked} disabled>
                  {formatMessage({ id: 'common_title.delete_confirmation' })}
                </ModalHeader>
                <ModalBody>
                  {formatMessage({ id: 'delete_this_record' })}
                </ModalBody>
                <ModalFooter>
                  <Button
                    color='danger'
                    onClick={onDeleteConfirmClicked}
                    disabled={deleting}
                  >
                    {formatMessage({ id: 'button.delete' })}
                    {deleting && <LoadingInline className='ml-3' />}
                  </Button>
                  <Button
                    color='secondary'
                    onClick={onCancelClicked}
                    disabled={deleting}
                  >
                    {formatMessage({ id: 'button.cancel' })}
                  </Button>
                </ModalFooter>
              </Modal>
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
