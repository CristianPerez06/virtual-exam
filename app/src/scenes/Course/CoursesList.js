import React, { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_COURSES, DELETE_COURSE } from './requests'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { ERROR_MESSAGES } from '../../common/constants'
import { Loading, LoadingInline, CustomAlert, Table } from '../../components/common'
import { Link } from 'react-router-dom'
import { syncCacheOnDelete } from './cacheHelpers'

const CoursesList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // State
  const [courses, setCourses] = useState([])
  const [errors, setErrors] = useState(null)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [courseDeleted, setCourseDeleted] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  // handlers
  const onCompleted = (res) => {
    if (!res) return
    setCourses(res.listCourses.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatedErrors = graphQLErrors.map(error => {
      const errorCode = ((error || {}).extensions || {}).code || ''
      switch (errorCode) {
        default:
          return { id: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, message: formatMessage({ id: 'common_error.internal_server_error' }) }
      }
    })

    setErrors(translatedErrors)
    setCourseDeleted(false)
    setDeleteModalIsOpen(false)
  }

  // Button handlers
  const onDeleteClicked = (course) => {
    setCourseToDelete(course)
    setDeleteModalIsOpen(true)
  }

  const onDeleteConfirmClicked = () => {
    deleteCourse({
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
  const { loading: fetching } = useQuery(LIST_COURSES, { variables: { q: '', offset: 0, limit: 100 }, onCompleted, onError })
  const [deleteCourse, { loading: deleting }] = useMutation(DELETE_COURSE, { onCompleted: stateCleanupOnDelete, onError })

  const columnTranslations = {
    courseName: formatMessage({ id: 'course_name' }),
    action: formatMessage({ id: 'action' }),
    edit: formatMessage({ id: 'button.edit' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columns = React.useMemo(
    () => {
      return [{
        Header: columnTranslations.courseName,
        accessor: 'name',
        Cell: ({ row }) => row.values.name
      },
      {
        Header: columnTranslations.action,
        Cell: ({ row }) => (
          <div className='d-flex justify-content-center'>
            <Link to={`/course/${row.original.id}`}>
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
    <div className='course-list'>
      {fetching && <Loading />}
      {!fetching &&
        <Card className='mx-auto'>
          <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
            <p className='h4'>
              <FormattedMessage id='common_entity.courses' />
            </p>
          </CardHeader>
          <CardBody className='d-flex flex-column text-center'>
            {courses.length === 0
              ? formatMessage({ id: 'common_message.no_results' })
              : <Table columns={columns} data={courses} />}

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
            {!deleting && courseDeleted && <CustomAlert messages={{ id: 'course_deleted', message: `${formatMessage({ id: 'course_deleted' })}: ${courseToDelete.name}` }} color='success' />}
          </CardBody>
        </Card>}
      {errors && <CustomAlert messages={errors} />}
    </div>
  )
}

export default injectIntl(CoursesList)
