import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import Select from 'react-select'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_COURSES } from '../../common/requests/courses'
import { LIST_UNITS } from '../../common/requests/units'
import { LIST_EXERCISES, DISABLE_EXERCISE } from '../../common/requests/exercises'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { TranslatableErrors, DeleteModal, TwoColumnsTable, LoadingInline } from '../../components/common'
import { syncCacheOnDelete } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { useAlert } from '../../hooks'

const ExercisesList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // Hooks
  const { alertSuccess, alertError } = useAlert()

  // State
  const [courses, setCourses] = useState([])
  const [units, setUnits] = useState([])
  const [exercises, setExercises] = useState([])
  const [errors, setErrors] = useState()
  const [filters, setFilters] = useState({ selectedCourse: null, selectedUnit: null })
  const [exerciseToDelete, setExerciseToDelete] = useState()
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  // Handlers
  const onFetchCoursesSuccess = (result) => {
    if (!result) return
    const mappedCourses = result.listCourses.data.map((course) => {
      return {
        value: course.id,
        label: course.name
      }
    })
    setCourses(mappedCourses)
  }

  const onFetchUnitsSuccess = (result) => {
    if (!result) return
    const mappedUnits = result.listUnits.data.map((unit) => {
      return {
        value: unit.id,
        label: unit.name
      }
    })
    setUnits(mappedUnits)
  }

  const onCompleted = (res) => {
    if (!res) return
    setExercises(res.listExercises.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
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
        const variables = { courseId: exerciseToDelete.courseId, unitId: exerciseToDelete.unitId }
        const updatedExercisesList = syncCacheOnDelete(cache, exerciseToDelete, variables)
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
    alertSuccess(formatMessage({ id: 'exercise_deleted' }))
  }

  // Queries and mutations
  const { loading: fetchingCourses } = useQuery(
    LIST_COURSES,
    {
      variables: {},
      onCompleted: onFetchCoursesSuccess,
      onError
    }
  )
  const { loading: fetchingUnits } = useQuery(
    LIST_UNITS,
    {
      variables: { courseId: (filters.selectedCourse || {}).value },
      skip: !filters.selectedCourse,
      onCompleted: onFetchUnitsSuccess,
      onError
    }
  )
  const { loading: fetching } = useQuery(
    LIST_EXERCISES,
    {
      variables: {
        courseId: (filters.selectedCourse || {}).value,
        unitId: (filters.selectedUnit || {}).value
      },
      skip: !filters.selectedCourse || !filters.selectedUnit,
      onCompleted,
      onError
    }
  )
  const [disableExercise, { loading: deleting }] = useMutation(DISABLE_EXERCISE, { onCompleted: stateCleanupOnDelete, onError })

  return (
    <div className='exercises-list' style={{ width: 850 + 'px' }}>
      <Card className='mx-auto shadow mb-3 bg-white rounded'>
        <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
          <p className='h4'>
            <FormattedMessage id='common_entity.exercises' />
          </p>
        </CardHeader>
        <CardBody className='d-flex flex-column text-center'>
          <div className='row d-flex justify-content-center mb-4'>
            <div className='col-md-10 col-xs-12'>
              <span className='text-left pl-1 pb-1'>
                <FormattedMessage id='common_entity.course' />
              </span>
              <Select
                value={filters.selectedCourse}
                options={courses}
                isDisabled={fetchingCourses}
                onChange={(option) => {
                  const selected = courses.find(x => x.value === option.value)
                  setFilters({ selectedCourse: selected, selectedUnit: null })
                  setExercises([])
                }}
              />
            </div>
          </div>

          <div className='row d-flex justify-content-center mb-4'>
            <div className='col-md-10 col-xs-12'>
              <span className='text-left pl-1 pb-1'>
                <FormattedMessage id='common_entity.unit' />
              </span>
              <Select
                value={filters.selectedUnit}
                options={units}
                isDisabled={fetchingUnits}
                onChange={(option) => {
                  const selected = units.find(x => x.value === option.value)
                  setFilters({ ...filters, selectedUnit: selected })
                }}
              />
            </div>
          </div>

          {fetching && <div className='text-center'><LoadingInline color='grey' /></div>}
          {!fetching && (
            <TwoColumnsTable
              entityName='exercise'
              entitiesPath='exercises'
              items={exercises}
              canEdit
              canDelete
              onDeleteClicked={onDeleteClicked}
            />
          )}

          {/* Delete modal */}
          <div id='delete-modal'>
            <DeleteModal
              modalIsOpen={deleteModalIsOpen}
              additionalInfo='exercise_delete_related_entities'
              isBussy={deleting}
              onCloseClick={() => onCancelClicked()}
              onDeleteClick={() => onDeleteConfirmClicked()}
            />
          </div>

        </CardBody>
      </Card>
      {errors && <TranslatableErrors errors={errors} />}
    </div>
  )
}

export default injectIntl(ExercisesList)
