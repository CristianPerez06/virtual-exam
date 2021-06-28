import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_COURSES } from '../../common/requests/courses'
import { LIST_UNITS, DISABLE_UNIT } from '../../common/requests/units'
import { useQuery, useMutation } from '@apollo/react-hooks'
import Select from 'react-select'
import { DeleteModal, TwoColumnsTable, LoadingInline } from '../../components/common'
import { syncCacheOnDelete } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { useAlert } from '../../hooks'

const UnitsList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // Hooks
  const { alertSuccess, alertError } = useAlert()

  // State
  const [courses, setCourses] = useState([])
  const [units, setUnits] = useState([])
  const [filters, setFilters] = useState({ selectedCourse: null })
  const [unitToDelete, setUnitToDelete] = useState()
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

  const onCompleted = (res) => {
    if (!res) return
    setUnits(res.listUnits.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
    setDeleteModalIsOpen(false)
  }

  // Button handlers
  const onDeleteClicked = (unit) => {
    setUnitToDelete(unit)
    setDeleteModalIsOpen(true)
  }

  const onDeleteConfirmClicked = () => {
    disableUnit({
      variables: { id: unitToDelete.id },
      update: (cache, result) => {
        const variables = { courseId: filters.selectedCourse.value }
        const updatedUnitList = syncCacheOnDelete(cache, unitToDelete, variables)
        setUnits(updatedUnitList.data)
      }
    })
  }

  const onCancelClicked = () => {
    if (deleting) return
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  // Other
  const stateCleanupOnDelete = () => {
    setDeleteModalIsOpen(false)
    alertSuccess(formatMessage({ id: 'unit_deleted' }))
  }

  // Queries and mutations
  const { loading: fetchingCourses } = useQuery(LIST_COURSES, { variables: {}, onCompleted: onFetchCoursesSuccess, onError })
  const { loading: fetching } = useQuery(
    LIST_UNITS,
    {
      variables: { courseId: (filters.selectedCourse || {}).value },
      skip: !filters.selectedCourse,
      onCompleted,
      onError
    }
  )

  const [disableUnit, { loading: deleting }] = useMutation(DISABLE_UNIT, { onCompleted: stateCleanupOnDelete, onError })

  return (
    <div className='units-list'>
      <Card className='mx-auto shadow mb-3 bg-white rounded'>
        <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
          <p className='h4'>
            <FormattedMessage id='common_entity.units' />
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
                  setFilters({ selectedCourse: selected })
                }}
              />
            </div>
          </div>

          {fetching && <div className='text-center'><LoadingInline color='grey' /></div>}
          {!fetching && (
            <TwoColumnsTable
              entityName='unit'
              entitiesPath='units'
              items={units}
              canEdit
              canDelete
              onDeleteClicked={onDeleteClicked}
            />
          )}

          {/* Delete dodal */}
          <div id='delete-modal'>
            <DeleteModal
              modalIsOpen={deleteModalIsOpen}
              additionalInfo='unit_delete_related_entities'
              isBussy={deleting}
              onCloseClick={() => onCancelClicked()}
              onDeleteClick={() => onDeleteConfirmClicked()}
            />
          </div>

        </CardBody>
      </Card>

    </div>
  )
}

export default injectIntl(UnitsList)
