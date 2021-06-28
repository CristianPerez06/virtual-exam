import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_COURSES, DISABLE_COURSE } from '../../common/requests/courses'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { DeleteModal, TwoColumnsTable, LoadingInline } from '../../components/common'
import { syncCacheOnDelete } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { useAlert } from '../../hooks'

const CoursesList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // State
  const [courses, setCourses] = useState([])
  const [courseToDelete, setCourseToDelete] = useState()
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  // Hooks
  const { alertSuccess, alertError } = useAlert()

  // Handlers
  const onCompleted = (res) => {
    if (!res) return
    setCourses(res.listCourses.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
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
    setDeleteModalIsOpen(false)
    alertSuccess(formatMessage({ id: 'course_deleted' }))
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(LIST_COURSES, { variables: {}, onCompleted, onError })
  const [disableCourse, { loading: deleting }] = useMutation(DISABLE_COURSE, { onCompleted: stateCleanupOnDelete, onError })

  return (
    <div className='courses-list'>
      <Card className='mx-auto shadow mb-3 bg-white rounded'>
        <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
          <p className='h4'>
            <FormattedMessage id='common_entity.courses' />
          </p>
        </CardHeader>
        <CardBody className='d-flex flex-column'>
          {fetching && <div className='text-center'><LoadingInline color='grey' /></div>}
          {!fetching && (
            <TwoColumnsTable
              entityName='course'
              entitiesPath='courses'
              items={courses}
              canEdit
              canDelete
              onDeleteClicked={onDeleteClicked}
            />
          )}

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
        </CardBody>
      </Card>
    </div>
  )
}

export default injectIntl(CoursesList)
