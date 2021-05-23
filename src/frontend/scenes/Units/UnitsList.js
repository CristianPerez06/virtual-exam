import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_COURSES } from '../../common/requests/courses'
import { LIST_UNITS, DISABLE_UNIT } from '../../common/requests/units'
import { useQuery, useMutation } from '@apollo/react-hooks'
import Select from 'react-select'
import { Loading, CustomAlert, TranslatableErrors, DeleteModal, TwoColumnsTable } from '../../components/common'
import { syncCacheOnDelete } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'

const UnitsList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // State
  const [courses, setCourses] = useState([])
  const [units, setUnits] = useState([])
  const [filters, setFilters] = useState({ selectedCourse: null })
  const [errors, setErrors] = useState()
  const [unitToDelete, setUnitToDelete] = useState()
  const [unitDeleted, setUnitDeleted] = useState(false)
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
    const translatableErrors = getTranslatableErrors(graphQLErrors)

    setErrors(translatableErrors)
    setUnitDeleted(false)
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
    setErrors()
    setDeleteModalIsOpen(false)
    setUnitDeleted(true)
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
    <div className='units-list' style={{ width: 850 + 'px' }}>
      {fetching && <Loading />}
      {!fetching &&
        <Card className='mx-auto'>
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
                    setErrors()
                  }}
                />
              </div>
            </div>

            <TwoColumnsTable
              entityName='unit'
              entitiesPath='units'
              items={units}
              canEdit
              canDelete
              onDeleteClicked={onDeleteClicked}
            />

            {/* Delete dodal */}
            <div id='delete-modal'>
              <DeleteModal
                modalIsOpen={deleteModalIsOpen}
                isBussy={deleting}
                onCloseClick={() => onCancelClicked()}
                onDeleteClick={() => onDeleteConfirmClicked()}
              />
            </div>

            {/* Alerts */}
            {!deleting && unitDeleted && <CustomAlert messages={{ id: 'unit_deleted', message: `${formatMessage({ id: 'unit_deleted' })}: ${unitToDelete.name}` }} color='success' />}
          </CardBody>
        </Card>}
      {errors && <TranslatableErrors errors={errors} />}
    </div>
  )
}

export default injectIntl(UnitsList)
