import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_COURSES, DISABLE_COURSE } from '../../common/requests/courses'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Loading, CustomAlert, TranslatableErrors, DeleteModal, TwoColumnsTable } from '../../components/common'
import { syncCacheOnDelete } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'

const CoursesList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // State
  const [courses, setCourses] = useState([])
  const [errors, setErrors] = useState()
  const [courseToDelete, setCourseToDelete] = useState()
  const [courseDeleted, setCourseDeleted] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  // Handlers
  const onCompleted = (res) => {
    if (!res) return
    setCourses(res.listCourses.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)

    setErrors(translatableErrors)
    setCourseDeleted(false)
    setDeleteModalIsOpen(false)
  }

  // Button handlers
  const onDeleteClicked = (course) => {
    setCourseToDelete(course)
    setDeleteModalIsOpen(true)
  }

  const onDeleteConfirmClicked = () => {
    disableCourse({
      variables: { id: courseToDelete.id },
      update: (cache, result) => {
        const updatedCoursesList = syncCacheOnDelete(cache, courseToDelete)
        setCourses(updatedCoursesList.data)
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
    setCourseDeleted(true)
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(LIST_COURSES, { variables: {}, onCompleted, onError })
  const [disableCourse, { loading: deleting }] = useMutation(DISABLE_COURSE, { onCompleted: stateCleanupOnDelete, onError })

  return (
    <div className='courses-list' style={{ width: 850 + 'px' }}>
      {fetching && <Loading />}
      {!fetching &&
        <Card className='mx-auto'>
          <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
            <p className='h4'>
              <FormattedMessage id='common_entity.courses' />
            </p>
          </CardHeader>
          <CardBody className='d-flex flex-column'>
            <TwoColumnsTable
              entityName='course'
              entitiesPath='courses'
              items={courses}
              canEdit
              canDelete
              onDeleteClicked={onDeleteClicked}
            />

            {/* Delete modal */}
            <div id='delete-modal'>
              <DeleteModal
                modalIsOpen={deleteModalIsOpen}
                additionalInfo='course_delete_related_entities'
                isBussy={deleting}
                onCloseClick={() => onCancelClicked()}
                onDeleteClick={() => onDeleteConfirmClicked()}
              />
            </div>

            {/* Alerts */}
            {!deleting && courseDeleted && <CustomAlert messages={{ id: 'course_deleted', message: `${formatMessage({ id: 'course_deleted' })}: ${courseToDelete.name}` }} color='success' />}
          </CardBody>
        </Card>}
      {errors && <TranslatableErrors errors={errors} />}
    </div>
  )
}

export default injectIntl(CoursesList)
